/**
 * Positions Controller
 *
 * Handles position-related HTTP requests.
 * Orchestrates position service operations.
 */

import type { Request, Response } from "express";
import {
    PositionQuerySchema,
    type PositionQuery,
    type CreatePositionRequest,
    type PositionCreateInput,
    type UpdatePositionRequest,
    type PositionUpdateInput,
} from "@backtrade/types";
import positionsService from "../services/base/positions-service";
import BadRequestError from "../errors/web/bad-request-error";
import UnAuthenticatedError from "../errors/web/unauthenticated-error";
import { logger } from "../libs/pino";

/**
 * Positions Controller
 *
 * Handles position-related HTTP requests.
 * Orchestrates position service operations.
 */
class PositionsController {
    private readonly logger: ReturnType<typeof logger.child>;

    constructor() {
        this.logger = logger.child({
            service: "positions-controller",
        });
    }

    /**
     * Get all positions for the currently authenticated user
     *
     * Supports optional session_id filter, status filter, and pagination.
     * Only returns positions belonging to sessions owned by the authenticated user.
     *
     * Query parameters:
     * - session_id: Optional session ID to filter positions by
     * - status: Optional position status filter (OPEN, CLOSED, LIQUIDATED)
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
    async getAllPositions(req: Request, res: Response): Promise<void> {
        // Ensure user is authenticated
        if (!req.user) {
            throw new UnAuthenticatedError(
                "You must be authenticated to access this route"
            );
        }

        const sessionId = req.query.session_id as string | undefined;

        // Parse and validate query parameters
        let query: PositionQuery | undefined;
        try {
            query = PositionQuerySchema.parse(req.query);
        } catch (error) {
            this.logger.debug(
                { query: req.query, error },
                "Invalid query parameters for positions"
            );
            throw new BadRequestError("Invalid query parameters");
        }

        // Fetch positions
        const positions = await positionsService.getAllPositions(
            sessionId,
            req.user,
            query
        );

        this.logger.trace(
            {
                userId: req.user.id,
                sessionId,
                count: positions.length,
                query,
            },
            "Positions retrieved for user"
        );

        res.status(200).json(positions);
    }

    /**
     * Get all positions for a specific session
     *
     * Returns positions belonging to the specified session.
     * Only returns positions if the user owns the session or is an admin.
     *
     * Query parameters:
     * - status: Optional position status filter (OPEN, CLOSED, LIQUIDATED)
     * - page: Page number (default: 1)
     * - limit: Items per page (default: 20, max: 100)
     * - sort: Field to sort by (default: updated_at)
     * - order: Sort order - "asc" or "desc" (default: "desc")
     *
     * @param req - Express request object (must have req.user set by authMiddleware)
     * @param res - Express response object
     * @throws BadRequestError if session ID is missing or query parameters are invalid
     * @throws UnAuthenticatedError if user is not authenticated
     */
    async getPositionsBySession(req: Request, res: Response): Promise<void> {
        // Ensure user is authenticated
        if (!req.user) {
            throw new UnAuthenticatedError(
                "You must be authenticated to access this route"
            );
        }

        const { sessionId } = req.params;
        if (!sessionId) {
            throw new BadRequestError("Session ID is required");
        }

        // Parse and validate query parameters
        let query: PositionQuery | undefined;
        try {
            query = PositionQuerySchema.parse(req.query);
        } catch (error) {
            this.logger.debug(
                { query: req.query, error },
                "Invalid query parameters for positions"
            );
            throw new BadRequestError("Invalid query parameters");
        }

        // Fetch positions for the session
        const positions = await positionsService.getAllPositions(
            sessionId,
            req.user,
            query
        );

        this.logger.trace(
            {
                userId: req.user.id,
                sessionId,
                count: positions.length,
                query,
            },
            "Positions retrieved for session"
        );

        res.status(200).json(positions);
    }

    /**
     * Create a new position
     *
     * Creates a position for the authenticated user with the provided data.
     * The session_id must belong to a session owned by the user.
     * Timestamps (created_at, updated_at) are set by the database.
     *
     * Request body must include:
     * - session_id: ID of the session this position belongs to
     * - side: Direction of the position (BUY or SELL)
     * - entry_price: Price at which the position was opened
     * - quantity_lots: Size of the position in lots
     * - opened_at: Timestamp when the position was opened
     * - position_status: Position status (must be OPEN - positions are closed via update)
     * - tp_price: Optional take profit price
     * - sl_price: Optional stop loss price
     *
     * Note: Positions must be created with status OPEN. To close a position, use the update operation.
     *
     * @param req - Express request object (must have req.user set by authMiddleware)
     * @param res - Express response object
     * @throws UnAuthenticatedError if user is not authenticated
     * @throws BadRequestError if request body is invalid
     */
    async createPosition(req: Request, res: Response): Promise<void> {
        // Ensure user is authenticated
        if (!req.user) {
            throw new UnAuthenticatedError(
                "You must be authenticated to create a position"
            );
        }

        const requestData = req.body as CreatePositionRequest;

        // Transform request data to create input
        // created_at and updated_at are set by database
        // Note: exit_price, closed_at, realized_pnl, commission_cost, slippage_cost, spread_cost
        // are not part of CreatePositionRequest - they should be set via update when closing the position
        const positionData: PositionCreateInput = {
            session_id: requestData.session_id,
            side: requestData.side,
            entry_price: requestData.entry_price,
            quantity_lots: requestData.quantity_lots,
            opened_at: requestData.opened_at,
            position_status: requestData.position_status ?? "OPEN",
            tp_price: requestData.tp_price,
            sl_price: requestData.sl_price,
        };

        this.logger.trace(
            {
                userId: req.user.id,
                session_id: requestData.session_id,
            },
            "Creating position for user"
        );

        const position = await positionsService.createPosition(
            positionData,
            req.user
        );

        this.logger.info(
            { userId: req.user.id, positionId: position.id },
            "Position created successfully"
        );

        res.status(201).json(position);
    }

    /**
     * Get a position by ID
     *
     * Returns a single position by its ID. Only returns positions belonging to sessions
     * owned by the authenticated user, unless the user is an admin.
     *
     * @param req - Express request object (must have req.user set by authMiddleware)
     * @param res - Express response object
     * @throws UnAuthenticatedError if user is not authenticated
     * @throws BadRequestError if position ID is missing or invalid
     * @throws NotFoundError if position doesn't exist
     * @throws ForbiddenError if user doesn't own the session and isn't admin
     */
    async getPositionById(req: Request, res: Response): Promise<void> {
        // Ensure user is authenticated
        if (!req.user) {
            throw new UnAuthenticatedError(
                "You must be authenticated to access this route"
            );
        }

        const { id } = req.params;
        if (!id) {
            throw new BadRequestError("Position ID is required");
        }

        const position = await positionsService.getPositionById(id, req.user);

        this.logger.trace(
            { id, userId: req.user.id },
            "Position retrieved successfully"
        );

        res.status(200).json(position);
    }

    /**
     * Update an existing position
     *
     * Updates a position with the provided data. Only allows updates to positions
     * belonging to sessions owned by the authenticated user, unless the user is an admin.
     *
     * Request body can include:
     * - position_status: Optional status (OPEN, CLOSED, LIQUIDATED)
     * - exit_price: Optional exit price (required if closing position)
     * - closed_at: Optional closed timestamp (required if closing position)
     * - realized_pnl: Optional realized profit/loss
     * - commission_cost: Optional commission cost
     * - slippage_cost: Optional slippage cost
     * - spread_cost: Optional spread cost
     * - tp_price: Optional take profit price
     * - sl_price: Optional stop loss price
     *
     * @param req - Express request object (must have req.user set by authMiddleware)
     * @param res - Express response object
     * @throws UnAuthenticatedError if user is not authenticated
     * @throws BadRequestError if position ID is missing or request body is invalid
     * @throws NotFoundError if position doesn't exist
     * @throws ForbiddenError if user doesn't own the session and isn't admin
     */
    async updatePosition(req: Request, res: Response): Promise<void> {
        // Ensure user is authenticated
        if (!req.user) {
            throw new UnAuthenticatedError(
                "You must be authenticated to update a position"
            );
        }

        const { id } = req.params;
        if (!id) {
            throw new BadRequestError("Position ID is required");
        }

        const requestData = req.body as UpdatePositionRequest;

        // Transform request data to update input
        // Handle null values for tp_price and sl_price (convert null to undefined)
        const positionData: PositionUpdateInput = {
            position_status: requestData.position_status,
            exit_price: requestData.exit_price,
            closed_at: requestData.closed_at,
            realized_pnl: requestData.realized_pnl,
            commission_cost: requestData.commission_cost,
            slippage_cost: requestData.slippage_cost,
            spread_cost: requestData.spread_cost,
            tp_price: requestData.tp_price ?? undefined,
            sl_price: requestData.sl_price ?? undefined,
        };

        this.logger.trace(
            { id, userId: req.user.id, updates: positionData },
            "Updating position"
        );

        const position = await positionsService.updatePosition(
            id,
            positionData,
            req.user
        );

        this.logger.info(
            { id, userId: req.user.id },
            "Position updated successfully"
        );

        res.status(200).json(position);
    }

    /**
     * Delete a position
     *
     * Deletes a position by its ID. Only allows deletion of positions belonging to
     * sessions owned by the authenticated user, unless the user is an admin.
     *
     * @param req - Express request object (must have req.user set by authMiddleware)
     * @param res - Express response object
     * @throws UnAuthenticatedError if user is not authenticated
     * @throws BadRequestError if position ID is missing
     * @throws NotFoundError if position doesn't exist
     * @throws ForbiddenError if user doesn't own the session and isn't admin
     */
    async deletePosition(req: Request, res: Response): Promise<void> {
        // Ensure user is authenticated
        if (!req.user) {
            throw new UnAuthenticatedError(
                "You must be authenticated to delete a position"
            );
        }

        const { id } = req.params;
        if (!id) {
            throw new BadRequestError("Position ID is required");
        }

        this.logger.trace({ id, userId: req.user.id }, "Deleting position");

        await positionsService.deletePosition(id, req.user);

        this.logger.info(
            { id, userId: req.user.id },
            "Position deleted successfully"
        );

        res.status(204).send();
    }
}

export default new PositionsController();
