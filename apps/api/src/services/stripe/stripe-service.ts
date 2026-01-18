/**
 * Stripe Service
 *
 * Handles Stripe Checkout Session creation and Customer Portal access.
 */

import { stripe } from "../../libs/stripe";
import { usersRepo, plansRepo } from "@backtrade/data";
import { usersCacheRepo } from "../../libs/cache";
import type { User } from "@backtrade/types";
import { BaseService } from "../base/base-service";
import NotFoundError from "../../errors/web/not-found-error";
import BadRequestError from "../../errors/web/bad-request-error";
import { ENV } from "../../config/env";

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
