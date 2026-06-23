/**
 * Stripe Webhook Service
 *
 * Handles Stripe webhook events with idempotency.
 */

import type Stripe from "stripe";
import { stripe } from "../../libs/stripe";
import { stripeEventsRepo } from "@backtrade/data";
import { BaseService } from "../base/base-service";
import { ENV } from "../../config/env";
import { upsertSubscriptionFromStripe } from "./subscription-sync";

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
     * Sync local subscription with Stripe data.
     * Delegates to the shared upsert so the webhook and the billing
     * reconciliation fallback stay in lockstep.
     */
    private async syncSubscription(
        stripeSubscription: Stripe.Subscription
    ): Promise<void> {
        this.logger.info(
            { subscriptionId: stripeSubscription.id, status: stripeSubscription.status },
            "Syncing subscription"
        );
        await upsertSubscriptionFromStripe(stripeSubscription);
    }
}

export default new WebhookService();
