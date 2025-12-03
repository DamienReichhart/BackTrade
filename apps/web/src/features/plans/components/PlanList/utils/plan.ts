/**
 * Check if a plan is the current plan
 *
 * @param currentSubscription - Current subscription (optional)
 * @param planId - Plan ID to check
 * @returns True if plan is the current plan
 */
export function isCurrentPlan(
    currentSubscription: { plan_id: number } | undefined,
    planId: number
): boolean {
    return currentSubscription?.plan_id === planId;
}
