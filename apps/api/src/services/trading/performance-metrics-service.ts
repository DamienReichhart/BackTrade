/**
 * Performance Metrics Service
 *
 * Pure calculation service for computing trading performance metrics
 * such as win rate, drawdown, and other statistical measures.
 * This service contains no database access - it receives data and returns calculations.
 */

import type { Position } from "@backtrade/types";
import { BaseService } from "../base/base-service";
import { toNumber } from "../../utils";

/**
 * Performance Metrics Service
 *
 * Handles all performance metric calculations for trading sessions.
 * All methods are pure functions with no side effects.
 */
class PerformanceMetricsService extends BaseService {
    constructor() {
        super("performance-metrics-service");
    }

    /**
     * Calculate win rate from closed positions
     *
     * Win rate = (number of winning trades / total closed trades) × 100
     *
     * A winning trade is one with realized_pnl > 0.
     * Only considers closed positions (CLOSED or LIQUIDATED status).
     *
     * @param closedPositions - Array of closed positions (CLOSED or LIQUIDATED status)
     * @returns Win rate as a percentage (0-100), or 0 if no closed positions
     */
    calculateWinRate(closedPositions: Position[]): number {
        if (closedPositions.length === 0) {
            this.logger.trace(
                { positionCount: closedPositions.length },
                "No closed positions, win rate is 0"
            );
            return 0;
        }

        // Convert Prisma Decimal to number for comparison
        const winningTrades = closedPositions.filter(
            (p) => toNumber(p.realized_pnl) > 0
        );

        const winRate = (winningTrades.length / closedPositions.length) * 100;

        this.logger.trace(
            {
                closedPositions: closedPositions.length,
                winningTrades: winningTrades.length,
                winRate,
            },
            "Calculated win rate"
        );

        return winRate;
    }

    /**
     * Calculate maximum drawdown from peak balance
     *
     * Drawdown = ((peak - current) / peak) × 100
     *
     * Measures the decline from the highest point (peak) to the current value.
     *
     * @param peakBalance - Highest balance achieved
     * @param currentEquity - Current equity (balance + unrealized PnL)
     * @returns Drawdown as a percentage (0-100), or 0 if current >= peak
     */
    calculateDrawdown(peakBalance: number, currentEquity: number): number {
        // No drawdown if we haven't declined from peak
        if (currentEquity >= peakBalance || peakBalance <= 0) {
            this.logger.trace(
                { peakBalance, currentEquity },
                "No drawdown, current >= peak or invalid peak"
            );
            return 0;
        }

        const drawdown = ((peakBalance - currentEquity) / peakBalance) * 100;

        this.logger.trace(
            {
                peakBalance,
                currentEquity,
                drawdown,
            },
            "Calculated drawdown"
        );

        return drawdown;
    }

    /**
     * Calculate profit factor
     *
     * Profit Factor = Gross Profit / Gross Loss
     *
     * A profit factor > 1 indicates overall profitability.
     *
     * @param closedPositions - Array of closed positions (CLOSED or LIQUIDATED status)
     * @returns Profit factor (null if no losses to divide by)
     */
    calculateProfitFactor(closedPositions: Position[]): number | null {
        if (closedPositions.length === 0) {
            return null;
        }

        let grossProfit = 0;
        let grossLoss = 0;

        for (const position of closedPositions) {
            const pnl = toNumber(position.realized_pnl);
            if (pnl > 0) {
                grossProfit += pnl;
            } else {
                grossLoss += Math.abs(pnl);
            }
        }

        // Avoid division by zero
        if (grossLoss === 0) {
            // All trades were profitable or breakeven
            return grossProfit > 0 ? Infinity : null;
        }

        const profitFactor = grossProfit / grossLoss;

        this.logger.trace(
            {
                closedPositions: closedPositions.length,
                grossProfit,
                grossLoss,
                profitFactor,
            },
            "Calculated profit factor"
        );

        return profitFactor;
    }

    /**
     * Calculate average trade return
     *
     * @param closedPositions - Array of closed positions (CLOSED or LIQUIDATED status)
     * @returns Average realized PnL per trade, or 0 if no closed positions
     */
    calculateAverageTrade(closedPositions: Position[]): number {
        if (closedPositions.length === 0) {
            return 0;
        }

        const totalPnL = closedPositions.reduce(
            (sum, p) => sum + toNumber(p.realized_pnl),
            0
        );

        const averageTrade = totalPnL / closedPositions.length;

        this.logger.trace(
            {
                closedPositions: closedPositions.length,
                totalPnL,
                averageTrade,
            },
            "Calculated average trade"
        );

        return averageTrade;
    }
}

export default new PerformanceMetricsService();
