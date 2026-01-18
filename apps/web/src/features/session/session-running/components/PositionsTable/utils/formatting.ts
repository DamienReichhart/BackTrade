import type { Position } from "@backtrade/types";

/**
 * Get the appropriate PnL value to display for a position
 *
 * Returns unrealized_pnl for open positions and realized_pnl for closed positions.
 *
 * @param position - Position object
 * @returns The PnL value to display (unrealized for open, realized for closed)
 */
export function getDisplayPnL(position: Position): number | null {
    return position.position_status === "OPEN"
        ? position.unrealized_pnl
        : position.realized_pnl;
}

/**
 * Format PnL value for display
 *
 * @param pnl - PnL value (can be null/undefined)
 * @returns Formatted PnL string with 2 decimal places
 */
export function formatPnL(pnl: number | null | undefined): string {
    return Number(pnl ?? 0).toFixed(2);
}

/**
 * Get PnL CSS class based on value
 *
 * @param pnl - PnL value (can be null/undefined)
 * @returns CSS class name for positive or negative PnL
 */
export function getPnLClassName(pnl: number | null | undefined): string {
    return (pnl ?? 0) >= 0 ? "pnlPos" : "pnlNeg";
}

/**
 * Format price or return fallback
 *
 * @param price - Price value (can be null/undefined)
 * @param fallback - Fallback value (default: "-")
 * @returns Formatted price string or fallback
 */
export function formatPriceOrFallback(
    price: number | null | undefined,
    fallback = "-"
): string {
    return price !== null && price !== undefined ? String(price) : fallback;
}
