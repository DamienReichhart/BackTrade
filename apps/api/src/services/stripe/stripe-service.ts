/**
 * Stripe Service
 *
 * Handles Stripe Checkout Session creation and Customer Portal access.
 */

import { stripe } from "../../libs/stripe";
import { usersRepo, plansRepo, subscriptionsRepo } from "@backtrade/data";
import { usersCacheRepo } from "../../libs/cache";
import {
    getPricingTierCodeDisplayLabel,
    type User,
    type Plan,
    type BillingOverviewResponse,
    type InvoiceListResponse,
    type PlanChangePreviewResponse,
    type SubscriptionActionResponse,
    type PricingTierCode,
} from "@backtrade/types";
import type Stripe from "stripe";
import { BaseService } from "../base/base-service";
import NotFoundError from "../../errors/web/not-found-error";
import BadRequestError from "../../errors/web/bad-request-error";
import { ENV } from "../../config/env";
import { upsertSubscriptionFromStripe } from "./subscription-sync";

type BillingStatusValue = BillingOverviewResponse["status"];

/**
 * Map a raw Stripe subscription status + cancel flag to a user-facing status.
 */
export function deriveBillingStatus(
    stripeStatus: string,
    cancelAtPeriodEnd: boolean
): BillingStatusValue {
    if (stripeStatus === "past_due" || stripeStatus === "unpaid") {
        return "past_due";
    }
    if (cancelAtPeriodEnd) return "canceling";
    if (stripeStatus === "active" || stripeStatus === "trialing") {
        return "active";
    }
    return "free";
}

/**
 * Extract a display card from an (expanded) payment method, if present.
 */
function extractCard(
    pm: string | Stripe.PaymentMethod | null | undefined
): BillingOverviewResponse["paymentMethod"] {
    if (!pm || typeof pm === "string" || !pm.card) return null;
    return {
        brand: pm.card.brand,
        last4: pm.card.last4,
        expMonth: pm.card.exp_month,
        expYear: pm.card.exp_year,
    };
}

/**
 * Period end (epoch seconds) lives on the first subscription item.
 */
function periodEndIso(sub: Stripe.Subscription): string | null {
    const end = sub.items.data[0]?.current_period_end ?? null;
    return end ? new Date(end * 1000).toISOString() : null;
}

interface ProrationParent {
    subscription_item_details?: { proration?: boolean };
}

/**
 * Sum the proration line items (in cents) from a preview invoice.
 */
function sumProrationLines(preview: Stripe.Invoice): number {
    return preview.lines.data.reduce((total, line) => {
        const parent = line.parent as ProrationParent | null | undefined;
        return parent?.subscription_item_details?.proration === true
            ? total + line.amount
            : total;
    }, 0);
}

/**
 * Map an updated Stripe subscription to the action response shape.
 */
function toActionResponse(
    sub: Stripe.Subscription
): SubscriptionActionResponse {
    return {
        status: deriveBillingStatus(sub.status, sub.cancel_at_period_end),
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        currentPeriodEnd: periodEndIso(sub),
    };
}

const FREE_OVERVIEW: BillingOverviewResponse = {
    status: "free",
    plan: {
        code: "FREE",
        displayName: "Free",
        price: 0,
        currency: "eur",
        maxActiveSessions: 1,
    },
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    nextCharge: null,
    paymentMethod: null,
};

class StripeService extends BaseService {
    constructor() {
        super("stripe-service");
    }

    /**
     * Create a Stripe Checkout Session
     */
    async createCheckoutSession(
        user: User,
        planId: number
    ): Promise<{ sessionId: string; url: string }> {
        const plan = await plansRepo.getPlanById(planId);
        if (!plan?.stripe_price_id) {
            throw new NotFoundError("Plan not found or invalid configuration");
        }

        const customerId = await this.getOrCreateStripeCustomer(user);

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [{ price: plan.stripe_price_id, quantity: 1 }],
            success_url: `${ENV.FRONTEND_URL}/dashboard/plans/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${ENV.FRONTEND_URL}/dashboard/plans`,
            metadata: {
                userId: user.id.toString(),
                planId: plan.id.toString(),
            },
            subscription_data: {
                metadata: {
                    userId: user.id.toString(),
                    planId: plan.id.toString(),
                },
            },
            allow_promotion_codes: true,
        });

        if (!session.url)
            throw new BadRequestError("Failed to create checkout session");

        return { sessionId: session.id, url: session.url };
    }

    /**
     * Create a Portal Session for subscription management
     */
    async createPortalSession(user: User): Promise<{ url: string }> {
        if (!user.stripe_customer_id) {
            throw new BadRequestError("No subscription account found.");
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: user.stripe_customer_id,
            return_url: `${ENV.FRONTEND_URL}/dashboard/plans`,
        });

        return { url: session.url };
    }

    /**
     * Verify checkout session status (used by frontend success page)
     */
    async getCheckoutSession(sessionId: string): Promise<{
        status: string;
        subscriptionId: string | null;
        customerId: string | null;
    }> {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        return {
            status: session.status ?? "unknown",
            subscriptionId:
                typeof session.subscription === "string"
                    ? session.subscription
                    : (session.subscription?.id ?? null),
            customerId:
                typeof session.customer === "string"
                    ? session.customer
                    : (session.customer?.id ?? null),
        };
    }

    /**
     * Aggregated billing overview for the plan management page.
     */
    async getBillingOverview(user: User): Promise<BillingOverviewResponse> {
        if (!user.stripe_customer_id) return FREE_OVERVIEW;

        let subscription =
            await subscriptionsRepo.getActiveSubscriptionByUserId(user.id);

        // Self-heal: the creation webhook may have been missed or delayed.
        // If the customer has an active subscription on Stripe but no local
        // row, reconcile it before reporting the user as Free.
        if (!subscription) {
            await this.reconcileActiveSubscription(user);
            subscription =
                await subscriptionsRepo.getActiveSubscriptionByUserId(user.id);
        }

        if (!subscription) return FREE_OVERVIEW;

        const plan = await plansRepo.getPlanById(subscription.plan_id);
        if (!plan) return FREE_OVERVIEW;

        const stripeSub = await stripe.subscriptions.retrieve(
            subscription.stripe_subscription_id,
            { expand: ["default_payment_method"] }
        );

        const status = deriveBillingStatus(
            stripeSub.status,
            stripeSub.cancel_at_period_end
        );
        const currentPeriodEnd = periodEndIso(stripeSub);
        const currency = plan.currency.toLowerCase();
        const price = Number(plan.price);

        return {
            status,
            plan: {
                code: plan.code,
                displayName: getPricingTierCodeDisplayLabel(
                    plan.code as PricingTierCode
                ),
                price,
                currency,
                maxActiveSessions: plan.max_active_sessions,
            },
            currentPeriodEnd,
            cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
            nextCharge:
                status === "active" && currentPeriodEnd
                    ? { amount: price, currency, date: currentPeriodEnd }
                    : null,
            paymentMethod: extractCard(
                stripeSub.default_payment_method as
                    | string
                    | Stripe.PaymentMethod
                    | null
            ),
        };
    }

    /**
     * Reconcile the user's active Stripe subscription into the local DB.
     *
     * Fallback for missed/delayed `customer.subscription.created` webhooks:
     * lists the customer's active Stripe subscriptions and mirrors the first
     * one locally using the same upsert as the webhook.
     */
    private async reconcileActiveSubscription(user: User): Promise<void> {
        if (!user.stripe_customer_id) return;

        const subscriptions = await stripe.subscriptions.list({
            customer: user.stripe_customer_id,
            status: "active",
            limit: 1,
        });

        const active = subscriptions.data[0];
        if (!active) return;

        await upsertSubscriptionFromStripe(active, user.id);
    }

    /**
     * Recent invoices for the user, newest first.
     */
    async listInvoices(user: User): Promise<InvoiceListResponse> {
        if (!user.stripe_customer_id) return [];

        const invoices = await stripe.invoices.list({
            customer: user.stripe_customer_id,
            limit: 24,
        });

        return invoices.data.map((inv) => ({
            id: inv.id ?? "",
            number: inv.number ?? null,
            date: new Date(inv.created * 1000).toISOString(),
            amount: (inv.amount_paid || inv.total || 0) / 100,
            currency: inv.currency,
            status: inv.status ?? "unknown",
            hostedUrl: inv.hosted_invoice_url ?? null,
            pdfUrl: inv.invoice_pdf ?? null,
        }));
    }

    /**
     * Resolve and validate a paid-to-paid plan change for the user.
     */
    private async requirePaidChange(
        user: User,
        planId: number
    ): Promise<{
        stripeSub: Stripe.Subscription;
        currentPlan: Plan;
        targetPlan: Plan;
        customerId: string;
    }> {
        if (!user.stripe_customer_id) {
            throw new BadRequestError("No active subscription to change.");
        }
        const subscription =
            await subscriptionsRepo.getActiveSubscriptionByUserId(user.id);
        if (!subscription) {
            throw new BadRequestError("No active subscription to change.");
        }
        const currentPlan = await plansRepo.getPlanById(subscription.plan_id);
        const targetPlan = await plansRepo.getPlanById(planId);
        if (!currentPlan) {
            throw new NotFoundError("Current plan not found");
        }
        if (!targetPlan) {
            throw new NotFoundError("Plan not found or invalid configuration");
        }
        if (targetPlan.id === currentPlan.id) {
            throw new BadRequestError("You are already on this plan.");
        }
        if (!targetPlan.stripe_price_id) {
            throw new NotFoundError("Plan not found or invalid configuration");
        }
        const stripeSub = await stripe.subscriptions.retrieve(
            subscription.stripe_subscription_id
        );
        if (!stripeSub.items.data[0]) {
            throw new BadRequestError("Subscription has no items.");
        }
        return {
            stripeSub,
            currentPlan,
            targetPlan,
            customerId: user.stripe_customer_id,
        };
    }

    /**
     * Preview the proration for switching to a paid plan.
     */
    async previewPlanChange(
        user: User,
        planId: number
    ): Promise<PlanChangePreviewResponse> {
        const { stripeSub, currentPlan, targetPlan, customerId } =
            await this.requirePaidChange(user, planId);

        const subItem = stripeSub.items.data[0];
        if (!subItem) {
            throw new BadRequestError("Subscription has no items.");
        }
        const itemId = subItem.id;
        const preview = await stripe.invoices.createPreview({
            customer: customerId,
            subscription: stripeSub.id,
            subscription_details: {
                items: [{ id: itemId, price: targetPlan.stripe_price_id }],
                proration_behavior: "always_invoice",
            },
        });

        return {
            amountDueToday: sumProrationLines(preview) / 100,
            currency: preview.currency,
            nextChargeAmount: Number(targetPlan.price),
            nextChargeDate: periodEndIso(stripeSub) ?? "",
            isUpgrade: Number(targetPlan.price) > Number(currentPlan.price),
        };
    }

    /**
     * Switch to a different paid plan immediately with proration.
     */
    async changePlan(
        user: User,
        planId: number
    ): Promise<SubscriptionActionResponse> {
        const { stripeSub, targetPlan } = await this.requirePaidChange(
            user,
            planId
        );
        const subItem = stripeSub.items.data[0];
        if (!subItem) {
            throw new BadRequestError("Subscription has no items.");
        }
        const updated = await stripe.subscriptions.update(stripeSub.id, {
            items: [{ id: subItem.id, price: targetPlan.stripe_price_id }],
            proration_behavior: "always_invoice",
        });
        return toActionResponse(updated);
    }

    /**
     * Resolve the user's active Stripe subscription or throw.
     */
    private async requireActiveStripeSub(
        user: User
    ): Promise<Stripe.Subscription> {
        if (!user.stripe_customer_id) {
            throw new BadRequestError("No active subscription found.");
        }
        const subscription =
            await subscriptionsRepo.getActiveSubscriptionByUserId(user.id);
        if (!subscription) {
            throw new BadRequestError("No active subscription found.");
        }
        return stripe.subscriptions.retrieve(
            subscription.stripe_subscription_id
        );
    }

    /**
     * Schedule cancellation at the end of the current period.
     */
    async cancelSubscription(
        user: User
    ): Promise<SubscriptionActionResponse> {
        const stripeSub = await this.requireActiveStripeSub(user);
        const updated = await stripe.subscriptions.update(stripeSub.id, {
            cancel_at_period_end: true,
        });
        return toActionResponse(updated);
    }

    /**
     * Undo a scheduled cancellation.
     */
    async resumeSubscription(
        user: User
    ): Promise<SubscriptionActionResponse> {
        const stripeSub = await this.requireActiveStripeSub(user);
        const updated = await stripe.subscriptions.update(stripeSub.id, {
            cancel_at_period_end: false,
        });
        return toActionResponse(updated);
    }

    /**
     * Helper: Get or create Stripe Customer
     */
    private async getOrCreateStripeCustomer(user: User): Promise<string> {
        if (user.stripe_customer_id) return user.stripe_customer_id;

        const customer = await stripe.customers.create({
            email: user.email,
            metadata: { userId: user.id.toString() },
        });

        await usersRepo.updateUser(user.id, {
            stripe_customer_id: customer.id,
        });
        await usersCacheRepo.invalidateCachedUser(user.id);

        return customer.id;
    }
}

export default new StripeService();
