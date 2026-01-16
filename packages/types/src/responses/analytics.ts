import { z } from "zod";
import { PositionSchema } from "../entities/position";

export const AnalyticsSummarySchema = z.object({
    total_trades: z.number(),
    expectancy: z.number(),
    commission_paid: z.number(),
    return_percentage: z.number(),
    win_rate: z.number(),
    profit_factor: z.number(),
    start_balance: z.number(),
    ending_equity: z.number(),
    net_pnl: z.number(),
    sharpe_ratio: z.number(),
    sortino_ratio: z.number(),
    max_drawdown: z.number(),
    win_streak: z.number(),
    lose_streak: z.number(),
});

export const EquityCurvePointSchema = z.object({
    time: z.string(),
    equity: z.number(),
});

export const TradeSideBreakdownSchema = z.object({
    count: z.number(),
    win_percentage: z.number(),
    pnl: z.number(),
    avg_pnl: z.number(),
});

export const AnalyticsBreakdownsSchema = z.object({
    long: TradeSideBreakdownSchema,
    short: TradeSideBreakdownSchema,
});

export const AnalyticsCostsSchema = z.object({
    commission: z.number(),
    spread_impact: z.number(),
    slippage: z.number(),
});

export const DailyPnLSchema = z.object({
    date: z.string(),
    trades: z.number(),
    win_rate: z.number(),
    gross_pnl: z.number(),
    costs: z.number(),
    net_pnl: z.number(),
});

export const SessionAnalyticsResponseSchema = z.object({
    summary: AnalyticsSummarySchema,
    equity_curve: z.array(EquityCurvePointSchema),
    breakdowns: AnalyticsBreakdownsSchema,
    costs: AnalyticsCostsSchema,
    top_winners: z.array(PositionSchema),
    worst_losers: z.array(PositionSchema),
    daily_pnl: z.array(DailyPnLSchema),
});

export type AnalyticsSummary = z.infer<typeof AnalyticsSummarySchema>;
export type EquityCurvePoint = z.infer<typeof EquityCurvePointSchema>;
export type TradeSideBreakdown = z.infer<typeof TradeSideBreakdownSchema>;
export type AnalyticsBreakdowns = z.infer<typeof AnalyticsBreakdownsSchema>;
export type AnalyticsCosts = z.infer<typeof AnalyticsCostsSchema>;
export type DailyPnL = z.infer<typeof DailyPnLSchema>;
export type SessionAnalyticsResponse = z.infer<
    typeof SessionAnalyticsResponseSchema
>;
