/**
 * PnL Calculation Service
 *
 * Pure calculation service for computing realized and unrealized profit/loss
 * for trading positions. This service contains no database access - it receives
 * data and returns calculations.
 *
 * All calculations use contract_size to convert lots to actual tradeable units:
 * - Standard Forex lot = 100,000 units of base currency
 * - Position value = quantity_lots × contract_size × price
 */

import type { Position } from "@backtrade/types";
import { BaseService } from "../base/base-service";
import { toNumber } from "../../utils";
import {
    TRADING_CONSTANTS,
    SIDE_MULTIPLIERS,
} from "../../config/trading-constants";

/**
 * PnL Calculation Service
 *
 * Handles all profit/loss calculations for trading positions.
 * All methods are pure functions with no side effects.
 */
class PnLCalculationService extends BaseService {
    constructor() {
        super("pnl-calculation-service");
    }

    /**
     * Calculate unrealized PnL for a single open position
     *
     * Formula:
     * - BUY: (currentPrice - entryPrice) × quantity_lots × contract_size
     * - SELL: (entryPrice - currentPrice) × quantity_lots × contract_size
     *
     * @param position - The open position to calculate PnL for
     * @param currentPrice - Current market price
     * @param contractSize - Contract size per lot (default: 100,000 for standard Forex lot)
     * @returns Unrealized PnL (positive = profit, negative = loss)
     */
    calculatePositionUnrealizedPnL(
        position: Position,
        currentPrice: number,
        contractSize: number = TRADING_CONSTANTS.DEFAULT_CONTRACT_SIZE
    ): number {
        // Convert Prisma Decimals to numbers for calculations
        const entryPrice = toNumber(position.entry_price);
        const quantityLots = toNumber(position.quantity_lots);

        const sideMultiplier = SIDE_MULTIPLIERS[position.side] ?? 1;
        const priceDifference = currentPrice - entryPrice;
        const unrealizedPnL =
            priceDifference * quantityLots * contractSize * sideMultiplier;

        this.logger.trace(
            {
                positionId: position.id,
                side: position.side,
                entryPrice,
                currentPrice,
                quantity: quantityLots,
                contractSize,
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
     * @param contractSize - Contract size per lot (default: 100,000 for standard Forex lot)
     * @returns Total unrealized PnL across all positions
     */
    calculateTotalUnrealizedPnL(
        positions: Position[],
        currentPrice: number,
        contractSize: number = TRADING_CONSTANTS.DEFAULT_CONTRACT_SIZE
    ): number {
        if (positions.length === 0) {
            return 0;
        }

        const totalUnrealizedPnL = positions.reduce((total, position) => {
            return (
                total +
                this.calculatePositionUnrealizedPnL(
                    position,
                    currentPrice,
                    contractSize
                )
            );
        }, 0);

        this.logger.trace(
            {
                positionCount: positions.length,
                currentPrice,
                contractSize,
                totalUnrealizedPnL,
            },
            "Calculated total unrealized PnL"
        );

        return totalUnrealizedPnL;
    }

    /**
     * Calculate realized PnL for a position being closed
     *
     * This is the gross PnL before trading costs (commission, spread, slippage).
     *
     * Formula:
     * - BUY: (exitPrice - entryPrice) × quantity_lots × contract_size
     * - SELL: (entryPrice - exitPrice) × quantity_lots × contract_size
     *
     * @param position - The position being closed
     * @param exitPrice - Price at which position is being closed
     * @param contractSize - Contract size per lot (default: 100,000 for standard Forex lot)
     * @returns Gross realized PnL (positive = profit, negative = loss)
     */
    calculateGrossRealizedPnL(
        position: Position,
        exitPrice: number,
        contractSize: number = TRADING_CONSTANTS.DEFAULT_CONTRACT_SIZE
    ): number {
        // Convert Prisma Decimals to numbers for calculations
        const entryPrice = toNumber(position.entry_price);
        const quantityLots = toNumber(position.quantity_lots);

        const sideMultiplier = SIDE_MULTIPLIERS[position.side] ?? 1;
        const priceDifference = exitPrice - entryPrice;
        const grossPnL =
            priceDifference * quantityLots * contractSize * sideMultiplier;

        this.logger.trace(
            {
                positionId: position.id,
                side: position.side,
                entryPrice,
                exitPrice,
                quantity: quantityLots,
                contractSize,
                grossPnL,
            },
            "Calculated gross realized PnL"
        );

        return grossPnL;
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
            return total + toNumber(position.realized_pnl);
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
