/**
 * Session Info Service
 *
 * Orchestration service that coordinates all calculations needed to
 * produce session information (equity, drawdown, win rate, margin level).
 * This is the main entry point for the session info endpoint.
 */

import type { User, SessionInfoResponse, Position } from "@backtrade/types";
import {
    candlesRepo,
    positionsRepo,
    transactionsRepo,
} from "@backtrade/data";
import { logger } from "../../libs/pino";
import sessionsService from "../base/sessions-service";
import pnlCalculationService from "./pnl-calculation-service";
import marginService from "./margin-service";
import performanceMetricsService from "./performance-metrics-service";

/**
 * Session Info Service
 *
 * Orchestrates all trading calculations to produce comprehensive session info.
 */
class SessionInfoService {
    private readonly logger: ReturnType<typeof logger.child>;

    constructor() {
        this.logger = logger.child({
            service: "session-info-service",
        });
    }

    /**
     * Get current market price for a session
     *
     * Retrieves the close price of the last M1 candle at or before
     * the session's current_time.
     *
     * @param instrumentId - Instrument to get price for
     * @param currentTime - Session's current time
     * @returns Current price or null if no candle data available
     */
    private async getCurrentPrice(
        instrumentId: number,
        currentTime: string
    ): Promise<number | null> {
        const candles = await candlesRepo.getLastCandlesByInstrumentAndTimeframe(
            instrumentId,
            "M1",
            currentTime,
            1
        );

        if (candles.length === 0) {
            this.logger.debug(
                { instrumentId, currentTime },
                "No candle data available for current price"
            );
            return null;
        }

        return candles[0]!.close;
    }

    /**
     * Get all positions for a session
     *
     * @param sessionId - Session ID
     * @returns Array of positions for the session
     */
    private async getSessionPositions(sessionId: number): Promise<Position[]> {
        const positions = await positionsRepo.getAllPositions({
            where: { session_id: { equals: sessionId } },
        });

        this.logger.trace(
            { sessionId, positionCount: positions.length },
            "Retrieved session positions"
        );

        return positions;
    }

    /**
     * Get open positions from a list of positions
     *
     * @param positions - All positions
     * @returns Only open positions
     */
    private filterOpenPositions(positions: Position[]): Position[] {
        return positions.filter((p) => p.position_status === "OPEN");
    }

    /**
     * Get peak balance achieved in the session
     *
     * Queries all transactions for the session and returns the maximum
     * balance_after value, which represents the highest realized balance.
     *
     * @param sessionId - Session ID
     * @param initialBalance - Session's initial balance (fallback if no transactions)
     * @returns Peak balance achieved
     */
    private async getPeakBalance(
        sessionId: number,
        initialBalance: number
    ): Promise<number> {
        const transactions = await transactionsRepo.getAllTransactions({
            where: { session_id: { equals: sessionId } },
        });

        if (transactions.length === 0) {
            // No transactions yet, peak is initial balance
            return initialBalance;
        }

        // Find max balance_after
        const maxBalanceAfter = Math.max(
            ...transactions.map((t) => t.balance_after)
        );

        // Peak is the higher of initial balance and max recorded balance
        const peakBalance = Math.max(initialBalance, maxBalanceAfter);

        this.logger.trace(
            {
                sessionId,
                transactionCount: transactions.length,
                maxBalanceAfter,
                initialBalance,
                peakBalance,
            },
            "Calculated peak balance"
        );

        return peakBalance;
    }

    /**
     * Get comprehensive session information
     *
     * Orchestrates all calculations to produce:
     * - start_balance: Initial balance
     * - current_equity: Current balance + unrealized PnL
     * - drawdown: Percentage decline from peak balance
     * - win_rate: Percentage of winning closed trades
     * - leverage: Session leverage setting
     * - margin_level: Equity / used margin * 100
     *
     * @param sessionId - Session ID
     * @param user - User making the request (for authorization)
     * @returns Complete session info response
     */
    async getSessionInfo(
        sessionId: string,
        user: User
    ): Promise<SessionInfoResponse> {
        // Fetch session (includes authorization check)
        const session = await sessionsService.getSessionById(sessionId, user);

        this.logger.debug(
            { sessionId, userId: user.id },
            "Fetching session info"
        );

        // Fetch all required data in parallel
        const [positions, currentPrice, peakBalance] = await Promise.all([
            this.getSessionPositions(session.id),
            this.getCurrentPrice(session.instrument_id, session.current_time),
            this.getPeakBalance(session.id, session.initial_balance),
        ]);

        // Separate open positions
        const openPositions = this.filterOpenPositions(positions);

        // Calculate unrealized PnL (0 if no price data)
        const unrealizedPnL =
            currentPrice !== null
                ? pnlCalculationService.calculateTotalUnrealizedPnL(
                      openPositions,
                      currentPrice
                  )
                : 0;

        // Calculate current equity
        const currentEquity = session.current_balance + unrealizedPnL;

        // Calculate used margin (0 if no price data or no open positions)
        const usedMargin =
            currentPrice !== null && openPositions.length > 0
                ? marginService.calculateUsedMargin(
                      openPositions,
                      currentPrice,
                      session.leverage
                  )
                : 0;

        // Calculate margin level
        const marginLevel = marginService.calculateMarginLevel(
            currentEquity,
            usedMargin
        );

        // Calculate win rate from all positions
        const winRate = performanceMetricsService.calculateWinRate(positions);

        // Calculate drawdown
        // Use max of peak balance and current equity for peak (in case equity exceeds recorded peak)
        const effectivePeakBalance = Math.max(peakBalance, currentEquity);
        const drawdown = performanceMetricsService.calculateDrawdown(
            effectivePeakBalance,
            currentEquity
        );

        const sessionInfo: SessionInfoResponse = {
            start_balance: session.initial_balance,
            current_equity: currentEquity,
            drawdown,
            win_rate: winRate,
            leverage: session.leverage,
            margin_level: marginLevel,
        };

        this.logger.debug(
            {
                sessionId,
                ...sessionInfo,
                openPositionCount: openPositions.length,
                totalPositionCount: positions.length,
                currentPrice,
                unrealizedPnL,
                usedMargin,
                peakBalance,
            },
            "Session info calculated"
        );

        return sessionInfo;
    }
}

export default new SessionInfoService();
