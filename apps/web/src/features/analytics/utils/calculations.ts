/**
 * Analytics calculation utilities
 */

/**
 * Calculate winning/losing streak from positions
 *
 * @param positions - Array of positions with realized_pnl
 * @returns Object with longest winning and losing streaks
 */
export function calculateStreaks(
    positions: Array<{ realized_pnl: number | string | null }>
): { winStreak: number; loseStreak: number } {
    let currentWin = 0;
    let currentLose = 0;
    let maxWin = 0;
    let maxLose = 0;

    for (const pos of positions) {
        if (pos.realized_pnl === null) continue;

        const pnl =
            typeof pos.realized_pnl === "string"
                ? parseFloat(pos.realized_pnl)
                : pos.realized_pnl;

        if (pnl > 0) {
            currentWin++;
            currentLose = 0;
            maxWin = Math.max(maxWin, currentWin);
        } else if (pnl < 0) {
            currentLose++;
            currentWin = 0;
            maxLose = Math.max(maxLose, currentLose);
        }
    }

    return { winStreak: maxWin, loseStreak: maxLose };
}
