import { z } from "zod";

/**
 * Trades view types for analytics
 */
export const TradesViewSchema = z.enum(["winners", "losers", "daily"]);
export type TradesView = z.infer<typeof TradesViewSchema>;

/**
 * Get all TradesView enum values as an array
 */
export const TRADES_VIEW_VALUES: TradesView[] = ["winners", "losers", "daily"];

/**
 * Map TradesView to display label
 */
const TRADES_VIEW_DISPLAY_MAP: Record<TradesView, string> = {
    winners: "Top Winners",
    losers: "Worst Losers",
    daily: "Daily PnL",
};

/**
 * Get display label for a TradesView enum value
 */
export function getTradesViewDisplayLabel(view: TradesView): string {
    return TRADES_VIEW_DISPLAY_MAP[view] ?? view;
}
