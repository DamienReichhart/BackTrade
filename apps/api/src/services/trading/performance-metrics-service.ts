/**
 * Performance Metrics Service
 *
 * Pure calculation service for computing trading performance metrics
 * such as win rate, drawdown, and other statistics. This service contains
 * no database access - it receives data and returns calculations.
 */

import type { Position } from "@backtrade/types";
import { logger } from "../../libs/pino";

/**
 * Position statuses that indicate a closed position
 */
const CLOSED_STATUSES = ["CLOSED", "LIQUIDATED"] as const;

/**
 * Performance Metrics Service
 *
 * Handles all performance-related calculations for trading sessions.
 * All methods are pure functions with no side effects.
 */
class PerformanceMetricsService {
    private readonly logger: ReturnType<typeof logger.child>;

    constructor() {
        this.logger = logger.child({
            service: "performance-metrics-service",
        });
    }

    /**
     * Calculate win rate from closed positions
     *
     * Win rate = (winning positions / total closed positions) * 100
     *
     * A winning position is one with realized_pnl > 0
     *
     * @param positions - Array of all positions (will filter to closed only)
     * @returns Win rate as a percentage (0-100), 0 if no closed positions
     */
    calculateWinRate(positions: Position[]): number {
        // Filter to only closed positions
        const closedPositions = positions.filter((p) =>
            CLOSED_STATUSES.includes(
                p.position_status as (typeof CLOSED_STATUSES)[number]
            )
        );

        if (closedPositions.length === 0) {
            this.logger.trace(
                { totalPositions: positions.length },
                "No closed positions, returning 0 win rate"
            );
            return 0;
        }

        // Count winning positions (realized_pnl > 0)
        const winningPositions = closedPositions.filter(
            (p) => (p.realized_pnl ?? 0) > 0
        );

        const winRate = (winningPositions.length / closedPositions.length) * 100;

        this.logger.trace(
            {
                totalClosedPositions: closedPositions.length,
                winningPositions: winningPositions.length,
                losingPositions: closedPositions.length - winningPositions.length,
                winRate,
            },
            "Calculated win rate"
        );

        return winRate;
    }

    /**
     * Calculate drawdown from peak balance to current equity
     *
     * Drawdown = ((peakBalance - currentEquity) / peakBalance) * 100
     *
     * Represents the percentage decline from the highest point.
     * Always returns a non-negative value.
     *
     * @param peakBalance - The highest balance achieved
     * @param currentEquity - Current account equity
     * @returns Drawdown as a percentage (0 = no drawdown, 100 = total loss)
     */
    calculateDrawdown(peakBalance: number, currentEquity: number): number {
        // Prevent division by zero and handle edge cases
        if (peakBalance <= 0) {
            this.logger.trace(
                { peakBalance, currentEquity },
                "Invalid peak balance, returning 0 drawdown"
            );
            return 0;
        }

        // If current equity is higher than peak, no drawdown
        if (currentEquity >= peakBalance) {
            this.logger.trace(
                { peakBalance, currentEquity },
                "Current equity >= peak balance, returning 0 drawdown"
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
     * Calculate profit factor (gross profit / gross loss)
     *
     * Profit factor > 1 indicates profitable trading
     * Profit factor < 1 indicates losing trading
     *
     * @param closedPositions - Array of closed positions
     * @returns Profit factor (0 if no losses)
     */
    calculateProfitFactor(closedPositions: Position[]): number {
        if (closedPositions.length === 0) {
            return 0;
        }

        let grossProfit = 0;
        let grossLoss = 0;

        for (const position of closedPositions) {
            const pnl = position.realized_pnl ?? 0;
            if (pnl > 0) {
                grossProfit += pnl;
            } else {
                grossLoss += Math.abs(pnl);
            }
        }

        // Avoid division by zero
        if (grossLoss === 0) {
            return grossProfit > 0 ? Infinity : 0;
        }

        const profitFactor = grossProfit / grossLoss;

        this.logger.trace(
            {
                closedPositionCount: closedPositions.length,
                grossProfit,
                grossLoss,
                profitFactor,
            },
            "Calculated profit factor"
        );

        return profitFactor;
    }

    /**
     * Count positions by status
     *
     * @param positions - Array of all positions
     * @returns Object with counts by status
     */
    countPositionsByStatus(positions: Position[]): {
        open: number;
        closed: number;
        liquidated: number;
    } {
        const counts = {
            open: 0,
            closed: 0,
            liquidated: 0,
        };

        for (const position of positions) {
            switch (position.position_status) {
                case "OPEN":
                    counts.open++;
                    break;
                case "CLOSED":
                    counts.closed++;
                    break;
                case "LIQUIDATED":
                    counts.liquidated++;
                    break;
            }
        }

        this.logger.trace(
            { ...counts, total: positions.length },
            "Counted positions by status"
        );

        return counts;
    }
}

export default new PerformanceMetricsService();
