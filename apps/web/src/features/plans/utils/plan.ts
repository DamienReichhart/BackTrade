/**
 * Label for the change action of a plan relative to the current one.
 */
export function changeActionLabel(
    currentRank: number,
    targetRank: number
): "Current plan" | "Upgrade" | "Downgrade" {
    if (targetRank === currentRank) return "Current plan";
    return targetRank > currentRank ? "Upgrade" : "Downgrade";
}
