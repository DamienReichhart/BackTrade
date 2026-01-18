/**
 * Stripe Webhook Service
 *
 * Handles Stripe webhook events with idempotency.
 */

import type Stripe from "stripe";
import { stripe } from "../../libs/stripe";
import {
    subscriptionsRepo,
    stripeEventsRepo,
    plansRepo,
} from "@backtrade/data";
import { BaseService } from "../base/base-service";
import { ENV } from "../../config/env";

/**
 * Webhook Service
 *
 * Processes Stripe webhook events with idempotency guarantees.
 * Uses a unified sync approach for all subscription events.
 */
class WebhookService extends BaseService {
    constructor() {
        super("webhook-service");
    }

    /**
     * Verify webhook signature and construct event
     */
    constructEvent(payload: Buffer, signature: string): Stripe.Event {
        return stripe.webhooks.constructEvent(
            payload,
            signature,
            ENV.STRIPE_WEBHOOK_SECRET
        );
    }

    /**
     * Process a Stripe webhook event with idempotency
     */
    async processEvent(event: Stripe.Event): Promise<void> {
        this.logger.info(
            { eventId: event.id, type: event.type },
            "Processing webhook event"
        );

        // Idempotency check
        const existingEvent =
            await stripeEventsRepo.getStripeEventByStripeEventId(event.id);

        if (existingEvent?.processed_at) {
            this.logger.info(
                { eventId: event.id },
                "Event already processed, skipping"
            );
            return;
        }

        // Store event (if not exists)
        const eventRecord =
            existingEvent ??
            (await stripeEventsRepo.createStripeEvent({
                stripe_event_id: event.id,
                type: event.type,
                payload: event.data.object as unknown as Record<
                    string,
                    unknown
                >,
                received_at: new Date().toISOString(),
            }));

        try {
            await this.handleEvent(event);

            // Mark processed
            await stripeEventsRepo.updateStripeEvent(eventRecord.id, {
                processed_at: new Date().toISOString(),
            });

            this.logger.info(
                { eventId: event.id },
                "Event processed successfully"
            );
        } catch (error) {
            this.logger.error(
                {
                    eventId: event.id,
                    error:
                        error instanceof Error ? error.message : String(error),
                },
                "Event processing failed"
            );
            throw error;
        }
    }

    /**
     * Route event to handler
     */
    private async handleEvent(event: Stripe.Event): Promise<void> {
        switch (event.type) {
            case "customer.subscription.created":
            case "customer.subscription.updated":
            case "customer.subscription.deleted":
                await this.syncSubscription(
                    event.data.object as Stripe.Subscription
                );
                break;

            case "checkout.session.completed":
                // We rely on subscription events for creation, but we can log success here
                const session = event.data.object as Stripe.Checkout.Session;
                this.logger.info(
                    { sessionId: session.id },
                    "Checkout completed"
                );
                break;

            default:
                this.logger.debug(
                    { type: event.type },
                    "Unhandled event type (safe to ignore)"
                );
        }
    }

    /**
     * Sync local subscription with Stripe data
     * This is the single source of truth for all subscription state changes.
     */
    private async syncSubscription(
        stripeSubscription: Stripe.Subscription
    ): Promise<void> {
        const { id, status, metadata, items, cancel_at } = stripeSubscription;

        this.logger.info(
            { subscriptionId: id, status },
            "Syncing subscription"
        );

        // 1. Identify User and Plan
        const userId = parseInt(metadata?.userId ?? "0", 10);

        // Handle Plan Change or Initial Setup: Get plan from price ID
        const firstItem = items.data[0];
        if (!firstItem) {
            this.logger.error(
                { subscriptionId: id },
                "No items in subscription"
            );
            return;
        }

        const priceId = firstItem.price.id;
        const plan = await plansRepo.getPlanByStripePriceId(priceId);

        if (!plan) {
            this.logger.error(
                { subscriptionId: id, priceId },
                "Plan not found for price ID"
            );
            return;
        }

        // 2. Map Status
        const dbStatus = this.mapStripeStatus(status);

        // 3. Map Dates
        // Stripe SDK v20+ moves these to SubscriptionItem
        const startDate = new Date(
            firstItem.current_period_start * 1000
        ).toISOString();
        const endDate = new Date(
            firstItem.current_period_end * 1000
        ).toISOString();

        // 4. Handle Cancellation
        // If cancel_at is set (non-null), the subscription is scheduled to cancel.
        const isCanceling = cancel_at !== null && cancel_at !== undefined;

        // 5. Upsert Subscription
        const existingSubscription =
            await subscriptionsRepo.getByStripeSubscriptionId(id);

        if (existingSubscription) {
            await subscriptionsRepo.updateSubscription(
                existingSubscription.id,
                {
                    status: dbStatus,
                    plan_id: plan.id, // Support plan upgrades/downgrades
                    current_period_start: startDate,
                    current_period_end: endDate,
                    cancel_at_period_end: isCanceling,
                }
            );
            this.logger.info({ subscriptionId: id }, "Subscription updated");
        } else {
            if (!userId) {
                this.logger.error(
                    { subscriptionId: id },
                    "Missing userId in metadata for new subscription"
                );
                return;
            }

            await subscriptionsRepo.createSubscription({
                user_id: userId,
                plan_id: plan.id,
                stripe_subscription_id: id,
                status: dbStatus,
                current_period_start: startDate,
                current_period_end: endDate,
                cancel_at_period_end: isCanceling,
            });
            this.logger.info({ subscriptionId: id }, "Subscription created");
        }
    }

    private mapStripeStatus(
        status: Stripe.Subscription.Status
    ): "active" | "canceled" {
        if (status === "active" || status === "trialing") return "active";
        return "canceled";
    }
}

export default new WebhookService();
