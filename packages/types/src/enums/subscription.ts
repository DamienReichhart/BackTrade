import { z } from "zod";

export const SubscriptionStatusSchema = z.enum([
    "active",
    "canceled",
    "trialing",
]);
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusSchema>;

/**
 * Get all SubscriptionStatus enum values as an array
 * Extracted from the enum schema definition
 */
export const SUBSCRIPTION_STATUS_VALUES: SubscriptionStatus[] = [
    "active",
    "canceled",
    "trialing",
];

/**
 * Map SubscriptionStatus to display label
 */
const SUBSCRIPTION_STATUS_DISPLAY_MAP: Record<SubscriptionStatus, string> = {
    active: "Active",
    canceled: "Canceled",
    trialing: "Trialing",
};

/**
 * Get display label for a SubscriptionStatus enum value
 */
export function getSubscriptionStatusDisplayLabel(
    status: SubscriptionStatus
): string {
    return SUBSCRIPTION_STATUS_DISPLAY_MAP[status] ?? status;
}

/**
 * Get SubscriptionStatus options for select dropdowns
 */
export function getSubscriptionStatusOptions(): Array<{
    value: SubscriptionStatus;
    label: string;
}> {
    return SUBSCRIPTION_STATUS_VALUES.map((status) => ({
        value: status,
        label: getSubscriptionStatusDisplayLabel(status),
    }));
}
