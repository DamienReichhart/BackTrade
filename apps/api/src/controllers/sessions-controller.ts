/**
 * Sessions Controller
 *
 * Handles session-related HTTP requests.
 * Orchestrates session service operations.
 */

import type { Request, Response } from "express";
import { SearchQuerySchema, type SearchQuery } from "@backtrade/types";
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
}

export default new SessionsController();
