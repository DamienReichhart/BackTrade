/**
 * Bar Advancement Service
 *
 * Orchestration service that processes bar advancement events:
 * - Check TP/SL levels against candle OHLC data
 * - Close positions that hit TP/SL
 * - Calculate margin level and trigger liquidation cascade if below 50%
 *
 * This service is triggered when session.current_time is advanced,
 * ensuring positions are properly managed during backtesting simulation.
 */

import type {
    Position,
    User,
    SessionWithInstrument,
    Candle,
    BarAdvancementResult,
    PositionClosureInfo,
    PositionClosureReason,
} from "@backtrade/types";
import { candlesRepo, positionsRepo, sessionsRepo } from "@backtrade/data";
import positionClosingService from "./position-closing-service";
import pnlCalculationService from "./pnl-calculation-service";
import { BaseService } from "../base/base-service";
import { toNumber } from "../../utils";
import { TRADING_CONSTANTS } from "../../config/trading-constants";
import tradingStateService from "./trading-state-service";

/**
 * TP/SL hit detection result
 */
interface TpSlHitResult {
    /** Whether TP or SL was hit */
    hit: true;
    /** Type of hit (TP or SL) */
    type: "TP" | "SL";
    /** Exit price (TP or SL price) */
    exitPrice: number;
    /** The candle that triggered the hit */
    candleTimestamp: string;
}

/**
 * Position with calculated unrealized PnL for sorting during liquidation
 */
interface PositionWithPnL {
    position: Position;
    unrealizedPnL: number;
}

/**
 * Bar Advancement Service
 *
 * Handles position management during bar advancement including
 * TP/SL execution and margin-based liquidation.
 */
class BarAdvancementService extends BaseService {
    constructor() {
        super("bar-advancement-service");
    }

    /**
     * Process bar advancement for a session
     *
     * This is the main entry point called when current_time is updated.
     * Performs:
     * 1. Fetch M1 candles in the advanced time range
     * 2. Check TP/SL for each open position
     * 3. Close positions that hit TP/SL
     * 4. Check margin level and liquidate if below 50%
     *
     * @param session - Session with instrument data
     * @param oldCurrentTime - Previous current_time value
     * @param newCurrentTime - New current_time value
     * @param user - User performing the operation
     * @returns Result containing closed positions and final margin/equity state
     */
    async processBarAdvancement(
        session: SessionWithInstrument,
        oldCurrentTime: string,
        newCurrentTime: string,
        user: User
    ): Promise<BarAdvancementResult> {
        this.logger.debug(
            {
                sessionId: session.id,
                oldCurrentTime,
                newCurrentTime,
                userId: user.id,
            },
            "Processing bar advancement"
        );

        const positionsClosed: PositionClosureInfo[] = [];

        // 1. Get all open positions for the session
        const openPositions = await this.getOpenPositionsForSession(session.id);

        if (openPositions.length === 0) {
            this.logger.debug(
                { sessionId: session.id },
                "No open positions, skipping bar advancement processing"
            );
            return {
                positionsClosed: [],
                marginLevelAfter: 0,
                equityAfter: toNumber(session.current_balance),
            };
        }

        // 2. Fetch M1 candles in the time range (exclusive of old, inclusive of new)
        // We need candles from after oldCurrentTime up to and including newCurrentTime
        const candles = await candlesRepo.getCandlesByInstrumentAndTimeframe(
            session.instrument_id,
            "M1",
            oldCurrentTime,
            newCurrentTime
        );

        // Filter out the candle at exactly oldCurrentTime since it was already processed
        const relevantCandles = candles.filter(
            (c) => new Date(c.ts).getTime() > new Date(oldCurrentTime).getTime()
        );

        if (relevantCandles.length === 0) {
            this.logger.warn(
                {
                    sessionId: session.id,
                    instrumentId: session.instrument_id,
                    oldCurrentTime,
                    newCurrentTime,
                },
                "No M1 candle data available for time range, skipping TP/SL checks"
            );
            // Still calculate margin level with current data
            return this.calculateFinalState(
                session,
                openPositions,
                newCurrentTime
            );
        }

        this.logger.trace(
            {
                sessionId: session.id,
                candleCount: relevantCandles.length,
                openPositionCount: openPositions.length,
            },
            "Checking TP/SL for positions"
        );

        // 3. Check TP/SL for each open position
        for (const position of openPositions) {
            const tpSlResult = this.checkTpSlHit(position, relevantCandles);

            if (tpSlResult) {
                this.logger.debug(
                    {
                        positionId: position.id,
                        type: tpSlResult.type,
                        exitPrice: tpSlResult.exitPrice,
                        candleTimestamp: tpSlResult.candleTimestamp,
                    },
                    "TP/SL hit detected"
                );

                try {
                    const closingResult =
                        await positionClosingService.closePosition(
                            position.id.toString(),
                            tpSlResult.exitPrice,
                            tpSlResult.candleTimestamp,
                            user,
                            "CLOSED"
                        );

                    positionsClosed.push({
                        positionId: position.id,
                        reason: tpSlResult.type,
                        exitPrice: tpSlResult.exitPrice,
                        realizedPnl: closingResult.netPnL,
                    });
                } catch (error) {
                    this.logger.error(
                        {
                            positionId: position.id,
                            error:
                                error instanceof Error
                                    ? error.message
                                    : String(error),
                        },
                        "Failed to close position on TP/SL hit"
                    );
                    // Continue processing other positions
                }
            }
        }

        // 4. Refresh session data to get updated balance after TP/SL closures
        const updatedSession = await this.refreshSession(session.id);

        // 5. Get remaining open positions after TP/SL closures
        const remainingPositions = await this.getOpenPositionsForSession(
            session.id
        );

        if (remainingPositions.length === 0) {
            this.logger.debug(
                { sessionId: session.id },
                "No remaining open positions after TP/SL closures"
            );
            return {
                positionsClosed,
                marginLevelAfter: 0,
                equityAfter: toNumber(updatedSession.current_balance),
            };
        }

        // 6. Get current price for margin/equity calculations
        const currentPrice = this.getCurrentPriceFromCandles(relevantCandles);

        // 7. Check margin level and perform liquidation cascade if needed
        const liquidationResult = await this.performLiquidationCascadeIfNeeded(
            updatedSession,
            remainingPositions,
            currentPrice,
            newCurrentTime,
            user
        );

        positionsClosed.push(...liquidationResult.liquidatedPositions);

        // 8. Update unrealized PnL for all remaining open positions
        const finalOpenPositions = await this.getOpenPositionsForSession(
            session.id
        );

        if (finalOpenPositions.length > 0) {
            const contractSize = session.instrument.contract_size;
            await this.updatePositionsUnrealizedPnL(
                finalOpenPositions,
                currentPrice,
                contractSize
            );
        }

        return {
            positionsClosed,
            marginLevelAfter: liquidationResult.marginLevelAfter,
            equityAfter: liquidationResult.equityAfter,
        };
    }

    /**
     * Check if a position's TP or SL was hit by any candle in the range
     *
     * TP/SL detection logic:
     * - BUY position:
     *   - TP hit if candle high >= tp_price
     *   - SL hit if candle low <= sl_price
     * - SELL position:
     *   - TP hit if candle low <= tp_price
     *   - SL hit if candle high >= sl_price
     *
     * When both TP and SL could be hit in the same candle, uses conservative
     * execution (assumes SL hit first for backtesting accuracy).
     *
     * @param position - Position to check
     * @param candles - M1 candles to check against (chronologically ordered)
     * @returns TP/SL hit result or null if neither was hit
     */
    private checkTpSlHit(
        position: Position,
        candles: Candle[]
    ): TpSlHitResult | null {
        const tpPrice = toNumber(position.tp_price) || null;
        const slPrice = toNumber(position.sl_price) || null;

        // If no TP/SL set, nothing to check
        if (!tpPrice && !slPrice) {
            return null;
        }

        const isBuy = position.side === "BUY";

        // Check each candle chronologically
        for (const candle of candles) {
            const high = toNumber(candle.high);
            const low = toNumber(candle.low);

            let tpHit = false;
            let slHit = false;

            if (isBuy) {
                // BUY position: profit when price goes up
                tpHit = tpPrice !== null && high >= tpPrice;
                slHit = slPrice !== null && low <= slPrice;
            } else {
                // SELL position: profit when price goes down
                tpHit = tpPrice !== null && low <= tpPrice;
                slHit = slPrice !== null && high >= slPrice;
            }

            // If both could be hit in the same candle, determine which hit first
            // using conservative execution (worst case for backtesting)
            if (tpHit && slHit) {
                // Use OHLC order logic with conservative assumption
                // If price opened closer to SL, assume SL hit first
                const type = this.determineExecutionPriority(
                    position,
                    candle,
                    tpPrice!,
                    slPrice!
                );
                const exitPrice = type === "TP" ? tpPrice! : slPrice!;

                return {
                    hit: true,
                    type,
                    exitPrice,
                    candleTimestamp: candle.ts,
                };
            }

            if (tpHit) {
                return {
                    hit: true,
                    type: "TP",
                    exitPrice: tpPrice!,
                    candleTimestamp: candle.ts,
                };
            }

            if (slHit) {
                return {
                    hit: true,
                    type: "SL",
                    exitPrice: slPrice!,
                    candleTimestamp: candle.ts,
                };
            }
        }

        return null;
    }

    /**
     * Determine execution priority when both TP and SL could hit in same candle
     *
     * Uses conservative backtesting approach:
     * - If open is closer to SL → assume SL hit first (worst case)
     * - If open is closer to TP → assume TP hit first (best case, but less conservative)
     *
     * For maximum backtesting conservatism, we assume SL hits first when in doubt.
     *
     * @param position - The position being checked
     * @param candle - The candle where both could hit
     * @param tpPrice - Take profit price
     * @param slPrice - Stop loss price
     * @returns Which level hit first
     */
    private determineExecutionPriority(
        position: Position,
        candle: Candle,
        tpPrice: number,
        slPrice: number
    ): "TP" | "SL" {
        const open = toNumber(candle.open);

        // Calculate distance from open to each level
        const distanceToTp = Math.abs(open - tpPrice);
        const distanceToSl = Math.abs(open - slPrice);

        // For conservative backtesting, if distances are equal or close,
        // assume SL hit first (worst case scenario)
        if (distanceToSl <= distanceToTp) {
            this.logger.trace(
                {
                    positionId: position.id,
                    side: position.side,
                    open,
                    tpPrice,
                    slPrice,
                    distanceToTp,
                    distanceToSl,
                    result: "SL",
                },
                "Both TP/SL could hit, assuming SL hit first (conservative)"
            );
            return "SL";
        }

        this.logger.trace(
            {
                positionId: position.id,
                side: position.side,
                open,
                tpPrice,
                slPrice,
                distanceToTp,
                distanceToSl,
                result: "TP",
            },
            "Both TP/SL could hit, TP was closer to open"
        );
        return "TP";
    }

    /**
     * Get current market price from the last candle in the range
     *
     * @param candles - Array of candles (chronologically ordered)
     * @returns Close price of the last candle
     */
    private getCurrentPriceFromCandles(candles: Candle[]): number {
        const lastCandle = candles[candles.length - 1];
        return toNumber(lastCandle!.close);
    }

    /**
     * Calculate margin level and equity for the current state
     *
     * Also updates unrealized PnL for all open positions.
     *
     * @param session - Session with instrument
     * @param openPositions - Current open positions
     * @param currentTime - Current simulation time
     * @returns Calculated margin level and equity
     */
    private async calculateFinalState(
        session: SessionWithInstrument,
        openPositions: Position[],
        currentTime: string
    ): Promise<BarAdvancementResult> {
        // Get current price
        const candles =
            await candlesRepo.getLastCandlesByInstrumentAndTimeframe(
                session.instrument_id,
                "M1",
                currentTime,
                1
            );

        if (candles.length === 0) {
            return {
                positionsClosed: [],
                marginLevelAfter: 0,
                equityAfter: toNumber(session.current_balance),
            };
        }

        const currentPrice = toNumber(candles[0]!.close);
        const contractSize = session.instrument.contract_size;

        // Calculate trading state using service
        const tradingState = tradingStateService.calculateTradingState(
            session,
            openPositions,
            currentPrice
        );

        // Update unrealized PnL for all open positions
        await this.updatePositionsUnrealizedPnL(
            openPositions,
            currentPrice,
            contractSize
        );

        return {
            positionsClosed: [],
            marginLevelAfter: tradingState.marginLevel,
            equityAfter: tradingState.equity,
        };
    }

    /**
     * Perform liquidation cascade if margin level is below threshold
     *
     * Liquidation process:
     * 1. Calculate current margin level
     * 2. If margin level < 50%, sort positions by unrealized PnL (worst first)
     * 3. Liquidate positions one by one until margin level >= 50%
     *
     * @param session - Session with instrument
     * @param openPositions - Current open positions
     * @param currentPrice - Current market price
     * @param closedAt - Timestamp for closures
     * @param user - User performing the operation
     * @returns Liquidation result with closed positions and final state
     */
    private async performLiquidationCascadeIfNeeded(
        session: SessionWithInstrument,
        openPositions: Position[],
        currentPrice: number,
        closedAt: string,
        user: User
    ): Promise<{
        liquidatedPositions: PositionClosureInfo[];
        marginLevelAfter: number;
        equityAfter: number;
    }> {
        const liquidatedPositions: PositionClosureInfo[] = [];
        const contractSize = session.instrument.contract_size;

        // Work with mutable copies
        let remainingPositions = [...openPositions];
        let currentSession = session;

        // Calculate initial state using service
        let tradingState = tradingStateService.calculateTradingState(
            currentSession,
            remainingPositions,
            currentPrice
        );
        let marginLevel = tradingState.marginLevel;
        let equity = tradingState.equity;

        this.logger.debug(
            {
                sessionId: session.id,
                marginLevel,
                equity,
                usedMargin: tradingState.usedMargin,
                threshold: TRADING_CONSTANTS.LIQUIDATION_THRESHOLD_PERCENT,
            },
            "Checking margin level for liquidation"
        );

        // Check if liquidation is needed
        if (
            marginLevel >= TRADING_CONSTANTS.LIQUIDATION_THRESHOLD_PERCENT ||
            marginLevel === 0
        ) {
            return {
                liquidatedPositions: [],
                marginLevelAfter: marginLevel,
                equityAfter: equity,
            };
        }

        this.logger.warn(
            {
                sessionId: session.id,
                marginLevel,
                threshold: TRADING_CONSTANTS.LIQUIDATION_THRESHOLD_PERCENT,
                openPositionCount: remainingPositions.length,
            },
            "Margin level below threshold, starting liquidation cascade"
        );

        // Sort positions by unrealized PnL (most negative first)
        const positionsWithPnL: PositionWithPnL[] = remainingPositions.map(
            (position) => ({
                position,
                unrealizedPnL:
                    pnlCalculationService.calculatePositionUnrealizedPnL(
                        position,
                        currentPrice,
                        contractSize
                    ),
            })
        );

        positionsWithPnL.sort((a, b) => a.unrealizedPnL - b.unrealizedPnL);

        // Liquidate positions until margin level is restored or no positions remain
        for (const {
            position,
            unrealizedPnL: positionPnL,
        } of positionsWithPnL) {
            if (
                marginLevel >= TRADING_CONSTANTS.LIQUIDATION_THRESHOLD_PERCENT
            ) {
                break;
            }

            this.logger.debug(
                {
                    positionId: position.id,
                    unrealizedPnL: positionPnL,
                    currentMarginLevel: marginLevel,
                },
                "Liquidating position"
            );

            try {
                const closingResult =
                    await positionClosingService.closePosition(
                        position.id.toString(),
                        currentPrice,
                        closedAt,
                        user,
                        "LIQUIDATED"
                    );

                liquidatedPositions.push({
                    positionId: position.id,
                    reason: "LIQUIDATION" as PositionClosureReason,
                    exitPrice: currentPrice,
                    realizedPnl: closingResult.netPnL,
                });

                // Remove liquidated position from remaining
                remainingPositions = remainingPositions.filter(
                    (p) => p.id !== position.id
                );

                // Refresh session data
                currentSession = await this.refreshSession(session.id);

                // Recalculate margin level using service
                tradingState = tradingStateService.calculateTradingState(
                    currentSession,
                    remainingPositions,
                    currentPrice
                );
                marginLevel = tradingState.marginLevel;
                equity = tradingState.equity;

                this.logger.debug(
                    {
                        sessionId: session.id,
                        positionId: position.id,
                        newMarginLevel: marginLevel,
                        newEquity: equity,
                        remainingPositions: remainingPositions.length,
                    },
                    "Position liquidated, recalculated margin"
                );
            } catch (error) {
                this.logger.error(
                    {
                        positionId: position.id,
                        error:
                            error instanceof Error
                                ? error.message
                                : String(error),
                    },
                    "Failed to liquidate position"
                );
                // Continue with next position
            }
        }

        if (
            marginLevel < TRADING_CONSTANTS.LIQUIDATION_THRESHOLD_PERCENT &&
            remainingPositions.length > 0
        ) {
            this.logger.warn(
                {
                    sessionId: session.id,
                    marginLevel,
                    remainingPositions: remainingPositions.length,
                    threshold: TRADING_CONSTANTS.LIQUIDATION_THRESHOLD_PERCENT,
                },
                "Liquidation cascade complete but margin level still below threshold"
            );
        }

        return {
            liquidatedPositions,
            marginLevelAfter: marginLevel,
            equityAfter: equity,
        };
    }

    /**
     * Update unrealized PnL for all provided positions
     *
     * Calculates the current unrealized PnL based on current market price
     * and persists it to the database for each position.
     *
     * @param positions - Open positions to update
     * @param currentPrice - Current market price
     * @param contractSize - Contract size for the instrument
     */
    private async updatePositionsUnrealizedPnL(
        positions: Position[],
        currentPrice: number,
        contractSize: number
    ): Promise<void> {
        for (const position of positions) {
            const unrealizedPnL =
                pnlCalculationService.calculatePositionUnrealizedPnL(
                    position,
                    currentPrice,
                    contractSize
                );

            await positionsRepo.updatePosition(position.id.toString(), {
                unrealized_pnl: unrealizedPnL,
            });

            this.logger.trace(
                {
                    positionId: position.id,
                    unrealizedPnL,
                    currentPrice,
                },
                "Updated position unrealized PnL"
            );
        }
    }

    /**
     * Refresh session data from database
     *
     * Helper method to fetch updated session data and handle errors consistently.
     *
     * @param sessionId - Session ID to refresh
     * @returns Updated session with instrument data
     * @throws Error if session not found
     */
    private async refreshSession(
        sessionId: number
    ): Promise<SessionWithInstrument> {
        const updatedSession =
            await sessionsRepo.getSessionWithInstrument(sessionId);
        if (!updatedSession) {
            throw new Error(`Session ${sessionId} not found`);
        }
        return updatedSession;
    }

    /**
     * Get all open positions for a session
     *
     * Helper method to fetch open positions with consistent query pattern.
     * Fetches only open positions at database level for optimal performance.
     *
     * @param sessionId - Session ID
     * @returns Array of open positions
     */
    private async getOpenPositionsForSession(
        sessionId: number
    ): Promise<Position[]> {
        return await positionsRepo.getOpenPositionsBySessionId(sessionId);
    }
}

export default new BarAdvancementService();
