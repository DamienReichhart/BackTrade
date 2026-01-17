/**
 * Session Info Service
 *
 * Orchestration service that coordinates all calculations needed to
 * produce session information (equity, drawdown, win rate, margin level).
 * This is the main entry point for the session info endpoint.
 *
 * All calculations use the instrument's contract_size for proper leverage handling:
 * - Standard Forex lot = 100,000 units of base currency
 * - Position value = quantity_lots × contract_size × price
 */

import type {
    User,
    SessionInfoResponse,
    Position,
    SessionWithInstrument,
} from "@backtrade/types";
import {
    candlesRepo,
    positionsRepo,
    sessionsRepo,
    transactionsRepo,
} from "@backtrade/data";
import sessionsService from "../base/sessions-service";
import performanceMetricsService from "./performance-metrics-service";
import NotFoundError from "../../errors/web/not-found-error";
import { BaseService } from "../base/base-service";
import { toNumber } from "../../utils";
import tradingStateService from "./trading-state-service";

/**
 * Session Info Service
 *
 * Orchestrates all trading calculations to produce comprehensive session info.
 */
class SessionInfoService extends BaseService {
    constructor() {
        super("session-info-service");
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
        const candles =
            await candlesRepo.getLastCandlesByInstrumentAndTimeframe(
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

        return toNumber(candles[0]!.close);
    }

    /**
     * Get open positions for a session
     *
     * Fetches only open positions at database level for optimal performance.
     *
     * @param sessionId - Session ID
     * @returns Array of open positions for the session
     */
    private async getOpenPositions(sessionId: number): Promise<Position[]> {
        const positions =
            await positionsRepo.getOpenPositionsBySessionId(sessionId);

        this.logger.trace(
            { sessionId, positionCount: positions.length },
            "Retrieved open positions"
        );

        return positions;
    }

    /**
     * Get closed positions for a session
     *
     * Fetches only closed positions (CLOSED or LIQUIDATED) at database level for optimal performance.
     *
     * @param sessionId - Session ID
     * @returns Array of closed positions for the session
     */
    private async getClosedPositions(sessionId: number): Promise<Position[]> {
        const positions =
            await positionsRepo.getClosedPositionsBySessionId(sessionId);

        this.logger.trace(
            { sessionId, positionCount: positions.length },
            "Retrieved closed positions"
        );

        return positions;
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
        const transactions = await transactionsRepo.findTransactions({
            where: { session_id: { equals: sessionId } },
        });

        if (transactions.length === 0) {
            // No transactions yet, peak is initial balance
            return initialBalance;
        }

        // Find max balance_after (convert Prisma Decimal to number)
        const maxBalanceAfter = Math.max(
            ...transactions.map((t) => toNumber(t.balance_after))
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
     * Get session with instrument data
     *
     * Fetches session and validates user access, then loads instrument
     * for contract_size needed in calculations.
     *
     * @param sessionId - Session ID
     * @param user - User making the request (for authorization)
     * @returns Session with instrument data
     * @throws NotFoundError if session not found
     * @throws ForbiddenError if user doesn't have access
     */
    private async getSessionWithInstrument(
        sessionId: string,
        user: User
    ): Promise<SessionWithInstrument> {
        // First validate access using sessions service
        await sessionsService.getSessionById(sessionId, user);

        // Then fetch with instrument
        const session = await sessionsRepo.getSessionWithInstrument(sessionId);
        if (!session) {
            throw new NotFoundError("Session not found");
        }

        return session;
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
     * All calculations use the instrument's contract_size for proper leverage handling.
     *
     * @param sessionId - Session ID
     * @param user - User making the request (for authorization)
     * @returns Complete session info response
     */
    async getSessionInfo(
        sessionId: string,
        user: User
    ): Promise<SessionInfoResponse> {
        // Fetch session with instrument (includes authorization check)
        const session = await this.getSessionWithInstrument(sessionId, user);
        const contractSize = session.instrument.contract_size;

        this.logger.debug(
            { sessionId, userId: user.id, contractSize },
            "Fetching session info"
        );

        // Convert Prisma Decimal to number for initial balance
        const initialBalance = toNumber(session.initial_balance);

        // Fetch all required data in parallel
        // Fetch open and closed positions separately at database level for optimal performance
        const [openPositions, closedPositions, currentPrice, peakBalance] =
            await Promise.all([
                this.getOpenPositions(session.id),
                this.getClosedPositions(session.id),
                this.getCurrentPrice(
                    session.instrument_id,
                    session.current_time
                ),
                this.getPeakBalance(session.id, initialBalance),
            ]);

        // Calculate trading state using service (0 if no price data)
        const tradingState =
            currentPrice !== null
                ? tradingStateService.calculateTradingState(
                      session,
                      openPositions,
                      currentPrice
                  )
                : {
                      currentBalance: toNumber(session.current_balance),
                      unrealizedPnL: 0,
                      equity: toNumber(session.current_balance),
                      usedMargin: 0,
                      marginLevel: 0,
                  };

        const currentEquity = tradingState.equity;
        const marginLevel = tradingState.marginLevel;

        // Calculate win rate from closed positions only
        const winRate =
            performanceMetricsService.calculateWinRate(closedPositions);

        // Calculate drawdown
        // Use max of peak balance and current equity for peak (in case equity exceeds recorded peak)
        const effectivePeakBalance = Math.max(peakBalance, currentEquity);
        const drawdown = performanceMetricsService.calculateDrawdown(
            effectivePeakBalance,
            currentEquity
        );

        const sessionInfo: SessionInfoResponse = {
            start_balance: initialBalance,
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
                closedPositionCount: closedPositions.length,
                currentPrice,
                unrealizedPnL: tradingState.unrealizedPnL,
                usedMargin: tradingState.usedMargin,
                peakBalance,
                contractSize,
            },
            "Session info calculated"
        );

        return sessionInfo;
    }
}

export default new SessionInfoService();
