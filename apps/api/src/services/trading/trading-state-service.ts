/**
 * Trading State Service
 *
 * Pure calculation service for computing complete trading state including
 * margin level, equity, and unrealized PnL. This encapsulates the repeated
 * calculation pattern used across multiple services.
 *
 * All calculations use contract_size to convert lots to actual tradeable units:
 * - Standard Forex lot = 100,000 units of base currency
 * - Position value = quantity_lots × contract_size × price
 */

import type { Position, SessionWithInstrument } from "@backtrade/types";
import { BaseService } from "../base/base-service";
import pnlCalculationService from "./pnl-calculation-service";
import marginService from "./margin-service";
import { toNumber } from "../../utils";

/**
 * Complete trading state for a session
 */
export interface TradingState {
    /** Current account balance from session */
    currentBalance: number;
    /** Total unrealized PnL across all open positions */
    unrealizedPnL: number;
    /** Current equity (balance + unrealized PnL) */
    equity: number;
    /** Total margin used by all open positions */
    usedMargin: number;
    /** Margin level as percentage (equity / used margin * 100) */
    marginLevel: number;
}

/**
 * Trading State Service
 *
 * Handles all trading state calculations for sessions.
 * All methods are pure functions with no side effects.
 */
class TradingStateService extends BaseService {
    constructor() {
        super("trading-state-service");
    }

    /**
     * Calculate complete trading state for a session
     *
     * This method encapsulates the common pattern of:
     * 1. Getting current balance from session
     * 2. Calculating unrealized PnL for open positions
     * 3. Calculating equity (balance + unrealized PnL)
     * 4. Calculating used margin
     * 5. Calculating margin level
     *
     * @param session - Session with instrument data (for contract_size and leverage)
     * @param openPositions - Array of currently open positions
     * @param currentPrice - Current market price for calculations
     * @returns Complete trading state
     */
    calculateTradingState(
        session: SessionWithInstrument,
        openPositions: Position[],
        currentPrice: number
    ): TradingState {
        const contractSize = session.instrument.contract_size;
        const currentBalance = toNumber(session.current_balance);

        // Calculate unrealized PnL for all open positions
        const unrealizedPnL = pnlCalculationService.calculateTotalUnrealizedPnL(
            openPositions,
            currentPrice,
            contractSize
        );

        // Calculate equity (balance + unrealized PnL)
        const equity = currentBalance + unrealizedPnL;

        // Calculate used margin
        const usedMargin = marginService.calculateUsedMargin(
            openPositions,
            currentPrice,
            session.leverage,
            contractSize
        );

        // Calculate margin level
        const marginLevel = marginService.calculateMarginLevel(
            equity,
            usedMargin
        );

        this.logger.trace(
            {
                sessionId: session.id,
                openPositionCount: openPositions.length,
                currentPrice,
                currentBalance,
                unrealizedPnL,
                equity,
                usedMargin,
                marginLevel,
            },
            "Calculated trading state"
        );

        return {
            currentBalance,
            unrealizedPnL,
            equity,
            usedMargin,
            marginLevel,
        };
    }
}

export default new TradingStateService();
