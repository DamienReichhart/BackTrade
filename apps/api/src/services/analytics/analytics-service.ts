import { sessionsRepo, positionsRepo, transactionsRepo } from "@backtrade/data";
import type {
    SessionAnalyticsResponse,
    EquityCurvePoint,
    DailyPnL,
    User,
    Position,
    Transaction,
    Session,
} from "@backtrade/types";
import { NotFoundError, ForbiddenError } from "../../errors";
import { logger } from "../../libs/pino";
import Decimal from "decimal.js";

class AnalyticsService {
    private readonly logger: ReturnType<typeof logger.child>;

    constructor() {
        this.logger = logger.child({
            service: "analytics-service",
        });
    }

    /**
     * Get analytics for a session
     */
    async getSessionAnalytics(
        sessionId: string,
        user: User
    ): Promise<SessionAnalyticsResponse> {
        const session = await sessionsRepo.getSessionById(sessionId);

        if (!session) {
            throw new NotFoundError("Session not found");
        }

        if (session.user_id !== user.id && user.role !== "ADMIN") {
            throw new ForbiddenError("Access denied");
        }

        // Fetch closed positions and transactions in parallel
        // Only need closed positions for analytics calculations
        const [closedPositions, transactions] = await Promise.all([
            positionsRepo.getClosedOrLiquidatedPositionsBySessionId(sessionId),
            transactionsRepo.getTransactionsBySessionId(sessionId),
        ]);

        return this.calculateAnalytics(session, closedPositions, transactions);
    }

    private calculateAnalytics(
        session: Session,
        closedPositions: Position[],
        transactions: Transaction[]
    ): SessionAnalyticsResponse {
        // Sort transactions by date for equity curve
        const sortedTransactions = [...transactions]
            .filter((t) => t.created_at)
            .sort(
                (a, b) =>
                    new Date(a.created_at!).getTime() -
                    new Date(b.created_at!).getTime()
            );

        // Positions are already filtered to closed positions at database level

        // Summary Stats
        const totalTrades = closedPositions.length;
        const startBalance = new Decimal(session.initial_balance);
        const currentBalance = new Decimal(session.current_balance);
        const netPnL = currentBalance.minus(startBalance);
        const returnPercentage = startBalance.isZero()
            ? new Decimal(0)
            : netPnL.div(startBalance).times(100);

        let winningTrades = 0;
        let grossProfit = new Decimal(0);
        let grossLoss = new Decimal(0);
        let totalCommission = new Decimal(0);
        let totalSlippage = new Decimal(0);
        let totalSpread = new Decimal(0);

        closedPositions.forEach((p) => {
            const realizedPnL = new Decimal(p.realized_pnl ?? 0);
            if (realizedPnL.greaterThan(0)) {
                winningTrades++;
                grossProfit = grossProfit.plus(realizedPnL);
            } else {
                grossLoss = grossLoss.plus(realizedPnL.abs());
            }

            totalCommission = totalCommission.plus(p.commission_cost ?? 0);
            totalSlippage = totalSlippage.plus(p.slippage_cost ?? 0);
            totalSpread = totalSpread.plus(p.spread_cost ?? 0);
        });

        const winRate =
            totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
        const profitFactor = grossLoss.isZero()
            ? grossProfit.isZero()
                ? 0
                : 999 // Infinite or 0
            : grossProfit.div(grossLoss).toNumber();
        const expectancy =
            totalTrades > 0 ? netPnL.div(totalTrades).toNumber() : 0;

        // Equity Curve & Drawdown
        let peakEquity = startBalance;
        let maxDrawdown = new Decimal(0);
        let runningBalance = startBalance;

        const equityCurve: EquityCurvePoint[] = [
            {
                time: new Date(session.start_time).toISOString(),
                equity: startBalance.toNumber(),
            },
        ];

        sortedTransactions.forEach((t) => {
            runningBalance = new Decimal(t.balance_after);
            if (runningBalance.greaterThan(peakEquity)) {
                peakEquity = runningBalance;
            }

            const drawdown = peakEquity
                .minus(runningBalance)
                .div(peakEquity)
                .times(100);
            if (drawdown.greaterThan(maxDrawdown)) {
                maxDrawdown = drawdown;
            }

            if (t.created_at) {
                equityCurve.push({
                    time: new Date(t.created_at).toISOString(),
                    equity: runningBalance.toNumber(),
                });
            }
        });

        // Breakdowns (Long/Short)
        const longPositions = closedPositions.filter((p) => p.side === "BUY");
        const shortPositions = closedPositions.filter((p) => p.side === "SELL");

        const calculateSideStats = (sidePositions: Position[]) => {
            const count = sidePositions.length;
            if (count === 0)
                return { count: 0, win_percentage: 0, pnl: 0, avg_pnl: 0 };

            let sideWins = 0;
            let sidePnL = new Decimal(0);

            sidePositions.forEach((p) => {
                const pnl = new Decimal(p.realized_pnl ?? 0);
                if (pnl.greaterThan(0)) sideWins++;
                sidePnL = sidePnL.plus(pnl);
            });

            return {
                count,
                win_percentage: (sideWins / count) * 100,
                pnl: sidePnL.toNumber(),
                avg_pnl: sidePnL.div(count).toNumber(),
            };
        };

        // Calculate streaks from all closed positions in chronological order
        const sortedByCloseTime = [...closedPositions].sort((a, b) => {
            // Sort by closed_at if available, otherwise fall back to opened_at
            const aTime = a.closed_at
                ? new Date(a.closed_at).getTime()
                : new Date(a.opened_at).getTime();
            const bTime = b.closed_at
                ? new Date(b.closed_at).getTime()
                : new Date(b.opened_at).getTime();
            return aTime - bTime;
        });

        let currentWin = 0;
        let currentLose = 0;
        let maxWin = 0;
        let maxLose = 0;

        for (const pos of sortedByCloseTime) {
            const pnl = new Decimal(pos.realized_pnl ?? 0);
            if (pnl.greaterThan(0)) {
                currentWin++;
                currentLose = 0;
                maxWin = Math.max(maxWin, currentWin);
            } else if (pnl.lessThan(0)) {
                currentLose++;
                currentWin = 0;
                maxLose = Math.max(maxLose, currentLose);
            }
            // Note: positions with realized_pnl === 0 reset both streaks
        }

        // Top/Worst
        const sortedByPnL = [...closedPositions].sort((a, b) =>
            new Decimal(b.realized_pnl ?? 0)
                .minus(new Decimal(a.realized_pnl ?? 0))
                .toNumber()
        );
        const topWinners = sortedByPnL.slice(0, 10);
        const worstLosers = sortedByPnL.slice(-10).reverse(); // worst first

        // Daily PnL
        const dailyPnLMap = new Map<
            string,
            {
                trades: number;
                wins: number;
                grossPnL: Decimal;
                costs: Decimal;
            }
        >();

        closedPositions.forEach((p) => {
            if (!p.closed_at) return;
            // Assuming closed_at is Date or string. If string, convert.
            const closedAt = p.closed_at;
            const dateStr = new Date(closedAt).toISOString().slice(0, 10);

            if (!dailyPnLMap.has(dateStr)) {
                dailyPnLMap.set(dateStr, {
                    trades: 0,
                    wins: 0,
                    grossPnL: new Decimal(0),
                    costs: new Decimal(0),
                });
            }

            const stats = dailyPnLMap.get(dateStr)!;
            stats.trades++;
            const pnl = new Decimal(p.realized_pnl ?? 0);
            if (pnl.greaterThan(0)) stats.wins++;

            // Net PnL = Realized PnL (which usually already includes costs in some systems,
            // but here realized_pnl might be gross or net depending on implementation.
            // Let's assume realized_pnl is NET based on standard trading ledger,
            // but let's check if costs are separate.
            // Looking at Position model: realized_pnl, commission_cost, slippage_cost, spread_cost.
            // Usually Realized PnL is the final result.
            // But let's assume Realized PnL is the result of the trade price diff * quantity.
            // If so, Net PnL = Realized PnL - Commission - Swap.
            // However, Transaction types include COMMISSION, PNL.
            // Let's rely on realized_pnl as the trade result.
            // The user wants "Gross PnL", "Costs", "Net PnL".
            // So Gross PnL = Realized PnL + Costs (if Realized is net) OR Realized PnL (if Realized is gross).
            // Let's assume Realized PnL is NET of price movement, but maybe NOT including commission if commission is a separate transaction.
            // Ideally: Gross PnL = (Exit - Entry) * Qty * ...
            // Costs = Commission + Swap + Slippage (estimated).
            // Net PnL = Gross - Costs.

            const costs = new Decimal(p.commission_cost ?? 0)
                .plus(p.slippage_cost ?? 0) // Slippage is usually embedded in price, but maybe tracked separately?
                .plus(p.spread_cost ?? 0); // Spread is definitely embedded.

            // If realized_pnl is "result from trade prices", it includes slippage and spread effects naturally.
            // Commission is often separate.
            // Let's calculate Gross PnL as Realized PnL + Commission (adding back commission if it was subtracted, or just taking Realized as Gross if it didn't subtract).
            // Given I don't know the exact calculation of realized_pnl in the engine, I will assume:
            // Net PnL for the day = Sum of Realized PnL of trades closed that day.
            // Costs = Sum of commission/slippage/spread fields.
            // Gross PnL = Net PnL + Commission? Or just Realized PnL is Gross?
            // Let's assume Realized PnL = Net Result of the trade (Price Diff * Qty).
            // Wait, if Commission is a separate Transaction, then Realized PnL on Position might be just price diff.
            // Let's stick to: Net PnL = realized_pnl. Costs = commission + slippage + spread. Gross = Net + Costs (if we consider costs as reductions).
            // Actually, usually Gross = PnL from price action. Net = Gross - Comm - Swap.
            // So I will calculate Gross = realized_pnl + commission_cost. (Assuming realized_pnl doesn't include comm).

            stats.grossPnL = stats.grossPnL
                .plus(pnl)
                .plus(new Decimal(p.commission_cost ?? 0));
            stats.costs = stats.costs.plus(costs);
        });

        const dailyPnL: DailyPnL[] = Array.from(dailyPnLMap.entries())
            .map(([date, stats]) => ({
                date,
                trades: stats.trades,
                win_rate:
                    stats.trades > 0 ? (stats.wins / stats.trades) * 100 : 0,
                gross_pnl: stats.grossPnL.toNumber(),
                costs: stats.costs.toNumber(),
                net_pnl: stats.grossPnL.minus(stats.costs).toNumber(),
            }))
            .sort(
                (a, b) =>
                    new Date(a.date).getTime() - new Date(b.date).getTime()
            );

        return {
            summary: {
                total_trades: totalTrades,
                expectancy,
                commission_paid: totalCommission.toNumber(),
                return_percentage: returnPercentage.toNumber(),
                win_rate: winRate,
                profit_factor: profitFactor,
                start_balance: startBalance.toNumber(),
                ending_equity: currentBalance.toNumber(),
                net_pnl: netPnL.toNumber(),
                sharpe_ratio: 0, // Complex calculation, skip for now or implement later
                sortino_ratio: 0, // Complex calculation
                max_drawdown: maxDrawdown.toNumber(),
                win_streak: maxWin,
                lose_streak: maxLose,
            },
            equity_curve: equityCurve,
            breakdowns: {
                long: calculateSideStats(longPositions),
                short: calculateSideStats(shortPositions),
            },
            costs: {
                commission: totalCommission.toNumber(),
                spread_impact: totalSpread.toNumber(),
                slippage: totalSlippage.toNumber(),
            },
            top_winners: topWinners,
            worst_losers: worstLosers,
            daily_pnl: dailyPnL,
        };
    }
}

export default new AnalyticsService();
