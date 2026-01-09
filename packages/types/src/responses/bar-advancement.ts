import { z } from "zod";

/**
 * Reason for position closure during bar advancement
 */
export const PositionClosureReasonSchema = z.enum(["TP", "SL", "LIQUIDATION"]);
export type PositionClosureReason = z.infer<typeof PositionClosureReasonSchema>;

/**
 * Information about a single position closure during bar advancement
 */
export const PositionClosureInfoSchema = z.object({
    /** ID of the closed position */
    positionId: z.number().int().positive(),
    /** Reason for closure */
    reason: PositionClosureReasonSchema,
    /** Price at which position was closed */
    exitPrice: z.number().positive(),
    /** Realized PnL from the closure (can be negative) */
    realizedPnl: z.number(),
});
export type PositionClosureInfo = z.infer<typeof PositionClosureInfoSchema>;

/**
 * Result of processing bar advancement
 *
 * Contains information about all position closures (TP/SL hits and liquidations)
 * and the final margin/equity state after processing.
 */
export const BarAdvancementResultSchema = z.object({
    /** List of positions that were closed during this bar advancement */
    positionsClosed: z.array(PositionClosureInfoSchema),
    /** Margin level after all closures (0 if no open positions remain) */
    marginLevelAfter: z.number().nonnegative(),
    /** Equity after all closures */
    equityAfter: z.number(),
});
export type BarAdvancementResult = z.infer<typeof BarAdvancementResultSchema>;
