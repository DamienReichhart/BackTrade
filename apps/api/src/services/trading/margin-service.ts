/**
 * Margin Service
 *
 * Pure calculation service for computing margin requirements and margin levels
 * for trading positions. This service contains no database access - it receives
 * data and returns calculations.
 *
 * All calculations use contract_size to convert lots to actual tradeable units:
 * - Standard Forex lot = 100,000 units of base currency
 * - Position value = quantity_lots × contract_size × price
 * - Required margin = position_value / leverage
 */

import type { Position } from "@backtrade/types";
import { BaseService } from "../base/base-service";
import { toNumber } from "../../utils";
import { TRADING_CONSTANTS } from "../../config/trading-constants";

/**
 * Margin Service
 *
 * Handles all margin-related calculations for trading positions.
 * All methods are pure functions with no side effects.
 */
class MarginService extends BaseService {
    constructor() {
        super("margin-service");
    }

    /**
     * Calculate margin requirement for a single position
     *
     * Formula: (quantity_lots × contract_size × currentPrice) / leverage
     *
     * @param position - The position to calculate margin for
     * @param currentPrice - Current market price
     * @param leverage - Account leverage multiplier
     * @param contractSize - Contract size per lot (default: 100,000 for standard Forex lot)
     * @returns Required margin for the position
     */
    calculatePositionMargin(
        position: Position,
        currentPrice: number,
        leverage: number,
        contractSize: number = TRADING_CONSTANTS.DEFAULT_CONTRACT_SIZE
    ): number {
        if (leverage <= 0) {
            this.logger.warn(
                { positionId: position.id, leverage },
                "Invalid leverage value, defaulting to 1"
            );
            leverage = 1;
        }

        // Convert Prisma Decimal to number for calculations
        const quantityLots = toNumber(position.quantity_lots);

        const positionValue = quantityLots * contractSize * currentPrice;
        const requiredMargin = positionValue / leverage;

        this.logger.trace(
            {
                positionId: position.id,
                quantity: quantityLots,
                contractSize,
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
     * @param contractSize - Contract size per lot (default: 100,000 for standard Forex lot)
     * @returns Total margin used by all positions
     */
    calculateUsedMargin(
        positions: Position[],
        currentPrice: number,
        leverage: number,
        contractSize: number = TRADING_CONSTANTS.DEFAULT_CONTRACT_SIZE
    ): number {
        if (positions.length === 0) {
            return 0;
        }

        const totalMargin = positions.reduce((total, position) => {
            return (
                total +
                this.calculatePositionMargin(
                    position,
                    currentPrice,
                    leverage,
                    contractSize
                )
            );
        }, 0);

        this.logger.trace(
            {
                positionCount: positions.length,
                currentPrice,
                leverage,
                contractSize,
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
