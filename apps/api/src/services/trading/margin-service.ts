/**
 * Margin Service
 *
 * Pure calculation service for computing margin requirements and margin levels
 * for trading positions. This service contains no database access - it receives
 * data and returns calculations.
 */

import type { Position } from "@backtrade/types";
import { logger } from "../../libs/pino";

/**
 * Margin Service
 *
 * Handles all margin-related calculations for trading positions.
 * All methods are pure functions with no side effects.
 */
class MarginService {
    private readonly logger: ReturnType<typeof logger.child>;

    constructor() {
        this.logger = logger.child({
            service: "margin-service",
        });
    }

    /**
     * Calculate margin requirement for a single position
     *
     * Formula: (quantity * currentPrice) / leverage
     *
     * @param position - The position to calculate margin for
     * @param currentPrice - Current market price
     * @param leverage - Account leverage multiplier
     * @returns Required margin for the position
     */
    calculatePositionMargin(
        position: Position,
        currentPrice: number,
        leverage: number
    ): number {
        if (leverage <= 0) {
            this.logger.warn(
                { positionId: position.id, leverage },
                "Invalid leverage value, defaulting to 1"
            );
            leverage = 1;
        }

        const positionValue = position.quantity_lots * currentPrice;
        const requiredMargin = positionValue / leverage;

        this.logger.trace(
            {
                positionId: position.id,
                quantity: position.quantity_lots,
                currentPrice,
                leverage,
                positionValue,
                requiredMargin,
            },
            "Calculated position margin"
        );

        return requiredMargin;
    }

    /**
     * Calculate total used margin for multiple open positions
     *
     * @param positions - Array of open positions
     * @param currentPrice - Current market price
     * @param leverage - Account leverage multiplier
     * @returns Total margin used by all positions
     */
    calculateUsedMargin(
        positions: Position[],
        currentPrice: number,
        leverage: number
    ): number {
        if (positions.length === 0) {
            return 0;
        }

        const totalMargin = positions.reduce((total, position) => {
            return (
                total +
                this.calculatePositionMargin(position, currentPrice, leverage)
            );
        }, 0);

        this.logger.trace(
            {
                positionCount: positions.length,
                currentPrice,
                leverage,
                totalMargin,
            },
            "Calculated total used margin"
        );

        return totalMargin;
    }

    /**
     * Calculate margin level (equity / used margin * 100)
     *
     * Margin level indicates account health:
     * - > 100%: Account is healthy
     * - 100%: At margin call level
     * - < 100%: Below margin call, risk of liquidation
     *
     * @param equity - Current account equity (balance + unrealized PnL)
     * @param usedMargin - Total margin used by open positions
     * @returns Margin level as a percentage (0 if no margin used)
     */
    calculateMarginLevel(equity: number, usedMargin: number): number {
        // If no margin is used, margin level is effectively infinite (no risk)
        // Return 0 to indicate no positions are open
        if (usedMargin <= 0) {
            this.logger.trace(
                { equity, usedMargin },
                "No margin used, returning 0 margin level"
            );
            return 0;
        }

        const marginLevel = (equity / usedMargin) * 100;

        this.logger.trace(
            {
                equity,
                usedMargin,
                marginLevel,
            },
            "Calculated margin level"
        );

        return marginLevel;
    }

    /**
     * Calculate free margin (equity - used margin)
     *
     * Free margin is the amount available for opening new positions.
     *
     * @param equity - Current account equity
     * @param usedMargin - Total margin used by open positions
     * @returns Free margin available
     */
    calculateFreeMargin(equity: number, usedMargin: number): number {
        const freeMargin = equity - usedMargin;

        this.logger.trace(
            {
                equity,
                usedMargin,
                freeMargin,
            },
            "Calculated free margin"
        );

        return freeMargin;
    }
}

export default new MarginService();
