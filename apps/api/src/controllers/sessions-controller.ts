/**
 * Sessions Controller
 *
 * Handles session-related HTTP requests.
 * Orchestrates session service operations.
 *
 * Note: All methods assume req.user is set by authMiddleware.
 * Routes using these methods must be protected by authMiddleware.
 */

import type { Request, Response } from "express";
import {
    SearchQuerySchema,
    TimeframeSchema,
    type SearchQuery,
    type CreateSessionRequest,
    type SessionCreateInput,
    type UpdateSessionRequest,
    type SessionUpdateInput,
    IdParamsSchema,
} from "@backtrade/types";
import { candlesRepo } from "@backtrade/data";
import sessionsService from "../services/base/sessions-service";
import sessionInfoService from "../services/trading/session-info-service";
import analyticsService from "../services/analytics/analytics-service";
import BadRequestError from "../errors/web/bad-request-error";
import { logger } from "../libs/pino";
import { TRADING_CONSTANTS } from "../config/trading-constants";

/**
 * Sessions Controller
 *
 * Handles session-related HTTP requests.
 * Orchestrates session service operations.
 */
class SessionsController {
    private readonly logger: ReturnType<typeof logger.child>;

    constructor() {
        this.logger = logger.child({
            service: "sessions-controller",
        });
    }

    /**
     * Get all sessions for the currently authenticated user
     *
     * Supports optional search query with pagination and sorting.
     * Only returns sessions belonging to the authenticated user.
     *
     * Query parameters:
     * - q: Optional search string (searches in session name)
     * - page: Page number (default: 1)
     * - limit: Items per page (default: 20, max: 100)
     * - sort: Field to sort by (default: updated_at)
     * - order: Sort order - "asc" or "desc" (default: "desc")
     *
     * @param req - Express request object (req.user guaranteed by authMiddleware)
     * @param res - Express response object
     * @throws BadRequestError if query parameters are invalid
     */
    async getAllSessions(req: Request, res: Response): Promise<void> {
        const user = req.user!;
        const userId = user.id;

        // Parse and validate query parameters
        let query: SearchQuery | undefined;
        try {
            query = SearchQuerySchema.parse(req.query);
        } catch (error) {
            this.logger.debug(
                { query: req.query, error },
                "Invalid query parameters for sessions"
            );
            throw new BadRequestError("Invalid query parameters");
        }

        // Fetch sessions for the authenticated user
        const sessions = await sessionsService.getAllSessions(userId, query);

        this.logger.trace(
            { userId, count: sessions.length, query },
            "Sessions retrieved for user"
        );

        res.status(200).json(sessions);
    }

    /**
     * Create a new session
     *
     * Creates a session for the authenticated user with the provided data.
     * The user_id is automatically set from the authenticated user.
     * Timestamps (created_at, updated_at) are set by the database.
     * Session status defaults to PAUSED if not provided.
     *
     * Request body must include:
     * - instrument_id: ID of the instrument to trade
     * - speed: Playback speed for the session
     * - start_time: Start timestamp of the trading session
     * - current_time: Current timestamp (must equal start_time)
     * - initial_balance: Starting balance for the session
     * - leverage: Leverage multiplier
     * - spread_pts: Spread in points
     * - slippage_pts: Slippage in points
     * - commission_per_fill: Commission per fill
     * - name: Optional session name
     * - end_time: Optional end timestamp (must be >= start_time)
     * - session_status: Optional status (defaults to PAUSED)
     *
     * @param req - Express request object (req.user guaranteed by authMiddleware)
     * @param res - Express response object
     * @throws BadRequestError if request body is invalid
     */
    async createSession(req: Request, res: Response): Promise<void> {
        const user = req.user!;
        const userId = user.id;
        const requestData = req.body as CreateSessionRequest;

        // Transform request data to create input
        // user_id comes from authenticated user, not request body
        // created_at and updated_at are set by database
        // session_status defaults to PAUSED if not provided
        // current_balance defaults to initial_balance for new sessions
        const sessionData: SessionCreateInput = {
            user_id: userId,
            instrument_id: requestData.instrument_id,
            name: requestData.name,
            speed: requestData.speed,
            start_time: requestData.start_time,
            current_time: requestData.current_time,
            end_time: requestData.end_time,
            initial_balance: requestData.initial_balance,
            current_balance: requestData.initial_balance,
            leverage: requestData.leverage,
            spread_pts: requestData.spread_pts,
            slippage_pts: requestData.slippage_pts,
            commission_per_fill: requestData.commission_per_fill,
            session_status: requestData.session_status ?? "PAUSED",
        };

        this.logger.trace(
            { userId, instrument_id: requestData.instrument_id },
            "Creating session for user"
        );

        const session = await sessionsService.createSession(sessionData);

        this.logger.info(
            { userId, sessionId: session.id },
            "Session created successfully"
        );

        res.status(201).json(session);
    }

    /**
     * Get a session by ID
     *
     * Returns a single session by its ID. Only returns sessions belonging to the
     * authenticated user, unless the user is an admin.
     *
     * @param req - Express request object (req.user guaranteed by authMiddleware)
     * @param res - Express response object
     * @throws BadRequestError if session ID is invalid or missing
     * @throws NotFoundError if session doesn't exist
     * @throws ForbiddenError if user doesn't own session and isn't admin
     */
    async getSessionById(req: Request, res: Response): Promise<void> {
        const user = req.user!;
        let id: string;
        try {
            ({ id } = IdParamsSchema.parse(req.params));
        } catch {
            throw new BadRequestError("Invalid session ID");
        }

        const session = await sessionsService.getSessionById(id, user);

        this.logger.trace(
            { id, userId: user.id },
            "Session retrieved successfully"
        );

        res.status(200).json(session);
    }

    /**
     * Get candles for a session
     *
     * Returns candles for the session's instrument in the specified timeframe,
     * up to the session's current_time. Only returns candles for sessions belonging to the
     * authenticated user, unless the user is an admin.
     *
     * Query parameters:
     * - timeframe: Required timeframe (M1, M5, M10, M15, M30, H1, H2, H4, D1, W1)
     *
     * @param req - Express request object (req.user guaranteed by authMiddleware)
     * @param res - Express response object
     * @throws BadRequestError if session ID is invalid or missing, timeframe is missing or invalid
     * @throws NotFoundError if session doesn't exist
     * @throws ForbiddenError if user doesn't own session and isn't admin
     */
    async getSessionCandles(req: Request, res: Response): Promise<void> {
        const user = req.user!;
        let id: string;
        try {
            ({ id } = IdParamsSchema.parse(req.params));
        } catch {
            throw new BadRequestError("Invalid session ID");
        }

        // Validate timeframe query parameter
        let timeframe: string;
        try {
            const parsed = TimeframeSchema.parse(req.query.timeframe);
            timeframe = parsed;
        } catch (error) {
            this.logger.debug(
                { timeframe: req.query.timeframe, error },
                "Invalid timeframe query parameter"
            );
            throw new BadRequestError(
                "timeframe query parameter is required and must be a valid timeframe (M1, M5, M10, M15, M30, H1, H2, H4, D1, W1)"
            );
        }

        // Get session (includes authorization check)
        const session = await sessionsService.getSessionById(id, user);

        // Get candles for the session's instrument and timeframe
        const candles =
            await candlesRepo.getLastCandlesByInstrumentAndTimeframe(
                session.instrument_id,
                timeframe,
                session.current_time,
                TRADING_CONSTANTS.MAX_CANDLES_FETCH
            );

        this.logger.trace(
            {
                id,
                userId: user.id,
                instrument_id: session.instrument_id,
                timeframe,
                current_time: session.current_time,
                candleCount: candles.length,
            },
            "Session candles retrieved successfully"
        );

        res.status(200).json(candles);
    }

    /**
     * Get session info (trading metrics)
     *
     * Returns calculated trading metrics for a session including:
     * - start_balance: Initial balance
     * - current_equity: Current balance + unrealized PnL
     * - drawdown: Percentage decline from peak balance
     * - win_rate: Percentage of winning closed trades
     * - leverage: Session leverage setting
     * - margin_level: Equity / used margin * 100
     *
     * Only returns info for sessions belonging to the authenticated user,
     * unless the user is an admin.
     *
     * @param req - Express request object (req.user guaranteed by authMiddleware)
     * @param res - Express response object
     * @throws BadRequestError if session ID is invalid or missing
     * @throws NotFoundError if session doesn't exist
     * @throws ForbiddenError if user doesn't own session and isn't admin
     */
    async getSessionInfo(req: Request, res: Response): Promise<void> {
        const user = req.user!;
        let id: string;
        try {
            ({ id } = IdParamsSchema.parse(req.params));
        } catch {
            throw new BadRequestError("Invalid session ID");
        }

        // Get session info (includes authorization check)
        const sessionInfo = await sessionInfoService.getSessionInfo(id, user);

        this.logger.trace(
            { id, userId: user.id },
            "Session info retrieved successfully"
        );

        res.status(200).json(sessionInfo);
    }

    /**
     * Get session analytics
     *
     * Returns detailed analytics for a session including:
     * - Performance summary
     * - Equity curve
     * - Trade breakdowns
     * - Costs analysis
     * - Top winners/losers
     * - Daily PnL
     *
     * @param req - Express request object
     * @param res - Express response object
     */
    async getSessionAnalytics(req: Request, res: Response): Promise<void> {
        const user = req.user!;
        let id: string;
        try {
            ({ id } = IdParamsSchema.parse(req.params));
        } catch {
            throw new BadRequestError("Invalid session ID");
        }

        const analytics = await analyticsService.getSessionAnalytics(id, user);

        this.logger.trace(
            { id, userId: user.id },
            "Session analytics retrieved successfully"
        );

        res.status(200).json(analytics);
    }

    /**
     * Update an existing session
     *
     * Updates a session with the provided data. Only allows updates to sessions
     * belonging to the authenticated user, unless the user is an admin.
     *
     * Request body can include:
     * - name: Optional session name
     * - session_status: Optional session status (RUNNING, PAUSED, ARCHIVED)
     * - speed: Optional playback speed
     * - current_time: Optional current timestamp (must be >= start_time and <= end_time)
     * - end_time: Optional end timestamp (must be >= start_time and >= current_time)
     *
     * @param req - Express request object (req.user guaranteed by authMiddleware)
     * @param res - Express response object
     * @throws BadRequestError if session ID is invalid or missing, or request body is invalid
     * @throws NotFoundError if session doesn't exist
     * @throws ForbiddenError if user doesn't own session and isn't admin
     */
    async updateSession(req: Request, res: Response): Promise<void> {
        const user = req.user!;
        let id: string;
        try {
            ({ id } = IdParamsSchema.parse(req.params));
        } catch {
            throw new BadRequestError("Invalid session ID");
        }

        const requestData = req.body as UpdateSessionRequest;

        // Transform request data to update input
        const sessionData: SessionUpdateInput = {
            name: requestData.name,
            session_status: requestData.session_status,
            speed: requestData.speed,
            current_time: requestData.current_time,
            end_time: requestData.end_time,
        };

        this.logger.trace(
            { id, userId: user.id, updates: sessionData },
            "Updating session"
        );

        const session = await sessionsService.updateSession(
            id,
            sessionData,
            user
        );

        this.logger.info(
            { id, userId: user.id },
            "Session updated successfully"
        );

        res.status(200).json(session);
    }

    /**
     * Delete a session
     *
     * Deletes a session by its ID. Only allows deletion of sessions belonging to
     * the authenticated user, unless the user is an admin.
     *
     * @param req - Express request object (req.user guaranteed by authMiddleware)
     * @param res - Express response object
     * @throws BadRequestError if session ID is invalid or missing
     * @throws NotFoundError if session doesn't exist
     * @throws ForbiddenError if user doesn't own session and isn't admin
     */
    async deleteSession(req: Request, res: Response): Promise<void> {
        const user = req.user!;
        let id: string;
        try {
            ({ id } = IdParamsSchema.parse(req.params));
        } catch {
            throw new BadRequestError("Invalid session ID");
        }

        this.logger.trace({ id, userId: user.id }, "Deleting session");

        await sessionsService.deleteSession(id, user);

        this.logger.info(
            { id, userId: user.id },
            "Session deleted successfully"
        );

        res.status(204).send();
    }
}

export default new SessionsController();
