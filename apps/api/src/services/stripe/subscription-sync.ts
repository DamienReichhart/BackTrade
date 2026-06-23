/**
 * Subscription sync
 *
 * Single source of truth for turning a Stripe subscription into a local
 * subscription row. Used by the webhook (event-driven) and by the billing
 * reconciliation fallback (when a webhook was missed or delayed).
 */

import type Stripe from "stripe";
import { subscriptionsRepo, plansRepo } from "@backtrade/data";
import { logger } from "../../libs/pino";

const log = logger.child({ service: "subscription-sync" });

function mapStripeStatus(
    status: Stripe.Subscription.Status
): "active" | "canceled" {
    if (status === "active" || status === "trialing") return "active";
    return "canceled";
}

/**
 * Create or update the local subscription row for a Stripe subscription.
 *
 * @param stripeSubscription - the Stripe subscription to mirror
 * @param fallbackUserId - used when the subscription metadata has no userId
 *   (e.g. during reconciliation, where the caller already knows the user)
 */
export async function upsertSubscriptionFromStripe(
    stripeSubscription: Stripe.Subscription,
    fallbackUserId?: number
): Promise<void> {
    const { id, status, metadata, items, cancel_at } = stripeSubscription;

    const metadataUserId = parseInt(metadata?.userId ?? "", 10);
    const userId = Number.isNaN(metadataUserId)
        ? (fallbackUserId ?? 0)
        : metadataUserId;

    const firstItem = items.data[0];
    if (!firstItem) {
        log.error({ subscriptionId: id }, "No items in subscription");
        return;
    }

    const priceId = firstItem.price.id;
    const plan = await plansRepo.getPlanByStripePriceId(priceId);
    if (!plan) {
        log.error({ subscriptionId: id, priceId }, "Plan not found for price ID");
        return;
    }

    const dbStatus = mapStripeStatus(status);
    const startDate = new Date(
        firstItem.current_period_start * 1000
    ).toISOString();
    const endDate = new Date(
        firstItem.current_period_end * 1000
    ).toISOString();
    const isCanceling = cancel_at !== null && cancel_at !== undefined;

    const existing = await subscriptionsRepo.getByStripeSubscriptionId(id);

    if (existing) {
        await subscriptionsRepo.updateSubscription(existing.id, {
            status: dbStatus,
            plan_id: plan.id,
            current_period_start: startDate,
            current_period_end: endDate,
            cancel_at_period_end: isCanceling,
        });
        log.info({ subscriptionId: id }, "Subscription updated");
        return;
    }

    if (!userId) {
        log.error(
            { subscriptionId: id },
            "Missing userId for new subscription"
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
    log.info({ subscriptionId: id }, "Subscription created");
}
