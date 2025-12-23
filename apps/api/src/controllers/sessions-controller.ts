/**
 * Sessions Controller
 *
 * Handles session-related HTTP requests.
 * Orchestrates session service operations.
 */

import type { Request, Response } from "express";
import {
    SearchQuerySchema,
    type SearchQuery,
    type CreateSessionRequest,
    type SessionCreateInput,
} from "@backtrade/types";
import sessionsService from "../services/base/sessions-service";
import BadRequestError from "../errors/web/bad-request-error";
import UnAuthenticatedError from "../errors/web/unauthenticated-error";
import { logger } from "../libs/pino";

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
     * @param req - Express request object (must have req.user set by authMiddleware)
     * @param res - Express response object
     * @throws BadRequestError if query parameters are invalid
     * @throws UnAuthenticatedError if user is not authenticated
     */
    async getAllSessions(req: Request, res: Response): Promise<void> {
        // Ensure user is authenticated
        if (!req.user) {
            throw new UnAuthenticatedError(
                "You must be authenticated to access this route"
            );
        }

        const userId = req.user.id;

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
     * @param req - Express request object (must have req.user set by authMiddleware)
     * @param res - Express response object
     * @throws UnAuthenticatedError if user is not authenticated
     * @throws BadRequestError if request body is invalid
     */
    async createSession(req: Request, res: Response): Promise<void> {
        // Ensure user is authenticated
        if (!req.user) {
            throw new UnAuthenticatedError(
                "You must be authenticated to create a session"
            );
        }

        const userId = req.user.id;
        const requestData = req.body as CreateSessionRequest;

        // Transform request data to create input
        // user_id comes from authenticated user, not request body
        // created_at and updated_at are set by database
        // session_status defaults to PAUSED if not provided
        const sessionData: SessionCreateInput = {
            user_id: userId,
            instrument_id: requestData.instrument_id,
            name: requestData.name,
            speed: requestData.speed,
            start_time: requestData.start_time,
            current_time: requestData.current_time,
            end_time: requestData.end_time,
            initial_balance: requestData.initial_balance,
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
}

export default new SessionsController();
