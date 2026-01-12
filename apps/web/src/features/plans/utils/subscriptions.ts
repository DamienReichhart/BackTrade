import type { Subscription } from "@backtrade/types";

/**
 * Find the current active subscription
 *
 * @param subscriptions - Array of subscriptions
 * @returns Current subscription or undefined
 */
export function findCurrentSubscription(
    subscriptions: Subscription[]
): Subscription | undefined {
    return subscriptions.find((sub) => sub.status === "active");
}

/**
 * Get status color class name
 *
 * @param status - Subscription status
 * @returns CSS class name for status color
 */
export function getStatusColorClass(status: string): string {
    switch (status) {
        case "active":
            return "statusActive";
        case "canceled":
            return "statusCanceled";
        case "past_due":
            return "statusPastDue";
        case "incomplete":
            return "statusIncomplete";
        case "incomplete_expired":
            return "statusIncompleteExpired";
        default:
            return "";
    }
}

/**
 * Check if subscription is active
 *
 * @param subscription - Subscription to check
 * @returns True if subscription is active
 */
export function isSubscriptionActive(subscription: Subscription): boolean {
    return subscription.status === "active";
}
