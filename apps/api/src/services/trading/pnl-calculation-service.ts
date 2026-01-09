/**
 * PnL Calculation Service
 *
 * Pure calculation service for computing realized and unrealized profit/loss
 * for trading positions. This service contains no database access - it receives
 * data and returns calculations.
 */

import type { Position } from "@backtrade/types";
import { logger } from "../../libs/pino";

/**
 * Side multiplier for PnL calculation
 * BUY positions profit when price goes up, SELL positions profit when price goes down
 */
const SIDE_MULTIPLIERS: Record<string, number> = {
    BUY: 1,
    SELL: -1,
};

/**
 * PnL Calculation Service
 *
 * Handles all profit/loss calculations for trading positions.
 * All methods are pure functions with no side effects.
 */
class PnLCalculationService {
    private readonly logger: ReturnType<typeof logger.child>;

    constructor() {
        this.logger = logger.child({
            service: "pnl-calculation-service",
        });
    }

    /**
     * Calculate unrealized PnL for a single open position
     *
     * Formula:
     * - BUY: (currentPrice - entryPrice) * quantity
     * - SELL: (entryPrice - currentPrice) * quantity
     *
     * @param position - The open position to calculate PnL for
     * @param currentPrice - Current market price
     * @returns Unrealized PnL (positive = profit, negative = loss)
     */
    calculatePositionUnrealizedPnL(
        position: Position,
        currentPrice: number
    ): number {
        const sideMultiplier = SIDE_MULTIPLIERS[position.side] ?? 1;
        const priceDifference = currentPrice - position.entry_price;
        const unrealizedPnL =
            priceDifference * position.quantity_lots * sideMultiplier;

        this.logger.trace(
            {
                positionId: position.id,
                side: position.side,
                entryPrice: position.entry_price,
                currentPrice,
                quantity: position.quantity_lots,
                unrealizedPnL,
            },
            "Calculated position unrealized PnL"
        );

        return unrealizedPnL;
    }

    /**
     * Calculate total unrealized PnL for multiple open positions
     *
     * @param positions - Array of open positions
     * @param currentPrice - Current market price
     * @returns Total unrealized PnL across all positions
     */
    calculateTotalUnrealizedPnL(
        positions: Position[],
        currentPrice: number
    ): number {
        if (positions.length === 0) {
            return 0;
        }

        const totalUnrealizedPnL = positions.reduce((total, position) => {
            return (
                total + this.calculatePositionUnrealizedPnL(position, currentPrice)
            );
        }, 0);

        this.logger.trace(
            {
                positionCount: positions.length,
                currentPrice,
                totalUnrealizedPnL,
            },
            "Calculated total unrealized PnL"
        );

        return totalUnrealizedPnL;
    }

    /**
     * Calculate total realized PnL from closed positions
     *
     * @param closedPositions - Array of closed positions with realized_pnl
     * @returns Total realized PnL
     */
    calculateTotalRealizedPnL(closedPositions: Position[]): number {
        if (closedPositions.length === 0) {
            return 0;
        }

        const totalRealizedPnL = closedPositions.reduce((total, position) => {
            return total + (position.realized_pnl ?? 0);
        }, 0);

        this.logger.trace(
            {
                positionCount: closedPositions.length,
                totalRealizedPnL,
            },
            "Calculated total realized PnL"
        );

        return totalRealizedPnL;
    }
}

export default new PnLCalculationService();
