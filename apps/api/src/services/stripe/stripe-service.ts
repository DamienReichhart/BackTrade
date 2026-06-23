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
    type BillingOverviewResponse,
    type InvoiceListResponse,
    type PricingTierCode,
} from "@backtrade/types";
import type Stripe from "stripe";
import { BaseService } from "../base/base-service";
import NotFoundError from "../../errors/web/not-found-error";
import BadRequestError from "../../errors/web/bad-request-error";
import { ENV } from "../../config/env";

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

        const subscription = await subscriptionsRepo.getActiveSubscriptionByUserId(
            user.id
        );
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
