import { positionsRepo } from "@backtrade/data";
import type {
    Position,
    PositionWhereInput,
    PositionCreateInput,
    PositionUpdateInput,
    PositionOrderBy,
    SearchQuery,
    User,
} from "@backtrade/types";
import { positionsCacheRepo } from "../../libs/cache";
import { logger } from "../../libs/pino";
import NotFoundError from "../../errors/web/not-found-error";
import BadRequestError from "../../errors/web/bad-request-error";
import sessionsService from "./sessions-service";

/**
 * Positions Service
 *
 * Handles business logic for position operations including CRUD, validation, and caching.
 */
class PositionsService {
    private readonly logger: ReturnType<typeof logger.child>;

    constructor() {
        this.logger = logger.child({
            service: "positions-service",
        });
    }

    /**
     * Validate that closed_at is greater than or equal to opened_at
     *
     * @param closedAt - Closed timestamp to validate
     * @param openedAt - Opened timestamp
     * @param positionId - Position ID for logging
     * @throws BadRequestError if closed_at < opened_at
     */
    private validateClosedAtAgainstOpenedAt(
        closedAt: Date,
        openedAt: Date,
        positionId: string
    ): void {
        if (closedAt < openedAt) {
            this.logger.debug(
                {
                    id: positionId,
                    closed_at: closedAt.toISOString(),
                    opened_at: openedAt.toISOString(),
                },
                "closed_at validation failed: must be >= opened_at"
            );
            throw new BadRequestError(
                "closed_at must be greater than or equal to opened_at"
            );
        }
    }

    /**
     * Validate position status transitions
     *
     * @param newStatus - New position status
     * @param currentStatus - Current position status
     * @param positionId - Position ID for logging
     * @throws BadRequestError if transition is invalid
     */
    private validatePositionStatusTransition(
        newStatus: string,
        currentStatus: string,
        positionId: string
    ): void {
        // Allow same status
        if (newStatus === currentStatus) {
            return;
        }

        // Invalid transitions
        if (currentStatus === "CLOSED" || currentStatus === "LIQUIDATED") {
            this.logger.debug(
                {
                    id: positionId,
                    currentStatus,
                    newStatus,
                },
                "Position status transition failed: cannot change from CLOSED/LIQUIDATED"
            );
            throw new BadRequestError(
                `Cannot change position status from ${currentStatus} to ${newStatus}`
            );
        }

        // OPEN -> CLOSED or LIQUIDATED is valid
        // OPEN -> OPEN is valid (no change)
        // Any other transition is invalid
        if (
            currentStatus === "OPEN" &&
            newStatus !== "CLOSED" &&
            newStatus !== "LIQUIDATED"
        ) {
            this.logger.debug(
                {
                    id: positionId,
                    currentStatus,
                    newStatus,
                },
                "Position status transition failed: invalid transition"
            );
            throw new BadRequestError(
                `Invalid position status transition from ${currentStatus} to ${newStatus}`
            );
        }
    }

    /**
     * Validate that required fields are present when closing a position
     *
     * @param position - Position update data
     * @param positionId - Position ID for logging
     * @throws BadRequestError if required fields are missing
     */
    private validatePositionClosingFields(
        position: PositionUpdateInput,
        positionId: string
    ): void {
        if (
            position.position_status === "CLOSED" ||
            position.position_status === "LIQUIDATED"
        ) {
            if (!position.exit_price) {
                this.logger.debug(
                    { id: positionId },
                    "Position closing validation failed: exit_price is required"
                );
                throw new BadRequestError(
                    "exit_price is required when closing a position"
                );
            }
            if (!position.closed_at) {
                this.logger.debug(
                    { id: positionId },
                    "Position closing validation failed: closed_at is required"
                );
                throw new BadRequestError(
                    "closed_at is required when closing a position"
                );
            }
        }
    }

    /**
     * Validate all business rules for position creation
     *
     * @param position - Position creation data
     * @throws BadRequestError if validation fails
     */
    private validatePositionCreation(position: PositionCreateInput): void {
        // Validate required fields
        if (!position.session_id) {
            throw new BadRequestError("session_id is required");
        }
        if (!position.side) {
            throw new BadRequestError("side is required");
        }
        if (!position.entry_price || position.entry_price <= 0) {
            throw new BadRequestError(
                "entry_price is required and must be positive"
            );
        }
        if (!position.quantity_lots || position.quantity_lots <= 0) {
            throw new BadRequestError(
                "quantity_lots is required and must be positive"
            );
        }
        if (!position.opened_at) {
            throw new BadRequestError("opened_at is required");
        }

        // Validate optional fields if provided
        if (position.tp_price !== undefined && position.tp_price !== null) {
            if (position.tp_price <= 0) {
                throw new BadRequestError(
                    "tp_price must be positive if provided"
                );
            }
        }
        if (position.sl_price !== undefined && position.sl_price !== null) {
            if (position.sl_price <= 0) {
                throw new BadRequestError(
                    "sl_price must be positive if provided"
                );
            }
        }

        // Validate position status - positions must be created as OPEN
        // They can be closed later via update operation
        if (position.position_status) {
            if (
                position.position_status === "CLOSED" ||
                position.position_status === "LIQUIDATED"
            ) {
                throw new BadRequestError(
                    "Positions must be created with status OPEN. Use update operation to close positions."
                );
            }
        }
    }

    /**
     * Validate all business rules for position update
     *
     * @param position - Position update data
     * @param existing - Existing position entity
     * @param positionId - Position ID for logging
     * @throws BadRequestError if validation fails
     */
    private validatePositionUpdateBusinessRules(
        position: PositionUpdateInput,
        existing: Position,
        positionId: string
    ): void {
        // Validate position status transition
        if (position.position_status !== undefined) {
            this.validatePositionStatusTransition(
                position.position_status,
                existing.position_status,
                positionId
            );
        }

        // Validate closing fields if status is being changed to CLOSED/LIQUIDATED
        this.validatePositionClosingFields(position, positionId);

        // Validate closed_at >= opened_at if closed_at is being updated
        if (position.closed_at !== undefined && position.closed_at !== null) {
            const openedAt = new Date(existing.opened_at);
            const closedAt = new Date(position.closed_at);
            this.validateClosedAtAgainstOpenedAt(
                closedAt,
                openedAt,
                positionId
            );
        }

        // Validate optional price fields
        if (position.exit_price !== undefined && position.exit_price !== null) {
            if (position.exit_price <= 0) {
                throw new BadRequestError("exit_price must be positive");
            }
        }
        if (position.tp_price !== undefined && position.tp_price !== null) {
            if (position.tp_price <= 0) {
                throw new BadRequestError("tp_price must be positive");
            }
        }
        if (position.sl_price !== undefined && position.sl_price !== null) {
            if (position.sl_price <= 0) {
                throw new BadRequestError("sl_price must be positive");
            }
        }

        // Validate cost fields are non-negative
        if (
            position.commission_cost !== undefined &&
            position.commission_cost !== null &&
            position.commission_cost < 0
        ) {
            throw new BadRequestError("commission_cost must be non-negative");
        }
        if (
            position.slippage_cost !== undefined &&
            position.slippage_cost !== null &&
            position.slippage_cost < 0
        ) {
            throw new BadRequestError("slippage_cost must be non-negative");
        }
        if (
            position.spread_cost !== undefined &&
            position.spread_cost !== null &&
            position.spread_cost < 0
        ) {
            throw new BadRequestError("spread_cost must be non-negative");
        }
    }

    /**
     * Get a position by ID with caching
     *
     * @param id - Position ID
     * @param user - User entity making the request (for authorization)
     * @returns Position entity
     * @throws NotFoundError if position doesn't exist
     * @throws ForbiddenError if user doesn't own the session and isn't admin
     */
    async getPositionById(id: string, user: User): Promise<Position> {
        const numericId = Number(id);
        const cachedPosition =
            await positionsCacheRepo.getCachedPosition(numericId);
        if (cachedPosition) {
            this.logger.trace({ id }, "Position found in cache");
            // Check session ownership - this will throw if user doesn't have access
            try {
                await sessionsService.getSessionById(
                    cachedPosition.session_id.toString(),
                    user
                );
                return cachedPosition;
            } catch (error) {
                // If ForbiddenError, user doesn't have access - throw immediately
                // If NotFoundError, session doesn't exist - invalidate cache and fetch fresh
                await positionsCacheRepo.invalidateCachedPosition(numericId);
                // Re-throw ForbiddenError immediately (user doesn't have access)
                // For NotFoundError, continue to fetch from DB to check if position still exists
                if (!(error instanceof NotFoundError)) {
                    throw error;
                }
                // If NotFoundError, continue to fetch position from DB
            }
        }
        this.logger.trace(
            { id },
            "Position not found in cache, fetching from database"
        );
        const position = await positionsRepo.getPositionById(id);
        if (!position) {
            this.logger.debug(
                { id },
                "Position not found, throwing not found error"
            );
            throw new NotFoundError("Position not found");
        }

        // Check session ownership - this will throw if user doesn't have access or session doesn't exist
        await sessionsService.getSessionById(
            position.session_id.toString(),
            user
        );

        await positionsCacheRepo.cachePosition(numericId, position);
        this.logger.trace({ id }, "Position cached");
        return position;
    }

    /**
     * Get all positions with optional filtering, pagination, and sorting
     *
     * @param sessionId - Optional session ID to filter positions by
     * @param user - User entity making the request (for authorization)
     * @param query - Optional search query with pagination and sorting
     * @returns Array of position entities
     * @throws ForbiddenError if user doesn't own the session and isn't admin
     */
    async getAllPositions(
        sessionId: string | undefined,
        user: User,
        query?: SearchQuery
    ): Promise<Position[]> {
        const { q, page = 1, limit = 20, sort, order = "desc" } = query ?? {};

        // Build where clause
        const where: PositionWhereInput = {};

        // Filter by session_id if provided
        if (sessionId) {
            const numericSessionId = Number(sessionId);
            // Verify session ownership - this will throw if user doesn't have access or session doesn't exist
            await sessionsService.getSessionById(sessionId, user);
            where.session_id = { equals: numericSessionId };
        } else {
            // If no session_id provided, we need to filter by user's sessions
            // Get all sessions for the user
            const userSessions = await sessionsService.getAllSessions(
                user.role === "ADMIN" ? undefined : user.id
            );
            const sessionIds = userSessions.map((s) => s.id);
            if (sessionIds.length === 0) {
                // User has no sessions, return empty array
                return [];
            }
            where.session_id = { in: sessionIds };
        }

        // Add search query if provided (could search by position_status, side, etc.)
        if (q) {
            const searchConditions: PositionWhereInput[] = [];

            // Try to match position_status
            if (q === "OPEN" || q === "CLOSED" || q === "LIQUIDATED") {
                searchConditions.push({ position_status: { equals: q } });
            }

            // Try to match side
            if (q === "BUY" || q === "SELL") {
                searchConditions.push({ side: { equals: q } });
            }

            if (searchConditions.length > 0) {
                if (where.session_id) {
                    // If session_id is set, combine it with search using AND
                    const sessionIdFilter = where.session_id;
                    where.AND = [
                        { session_id: sessionIdFilter },
                        { OR: searchConditions },
                    ];
                    // Remove session_id from top level since it's now in AND
                    delete where.session_id;
                } else {
                    where.OR = searchConditions;
                }
            }
        }

        // Validate sort parameter against valid Position fields
        const validPositionSortFields = [
            "id",
            "session_id",
            "position_status",
            "side",
            "quantity_lots",
            "entry_price",
            "exit_price",
            "opened_at",
            "closed_at",
            "realized_pnl",
            "created_at",
            "updated_at",
        ] as const;
        const orderBy: PositionOrderBy | undefined =
            sort &&
            validPositionSortFields.includes(
                sort as (typeof validPositionSortFields)[number]
            )
                ? { [sort]: order }
                : undefined;

        return positionsRepo.getAllPositions({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy,
        });
    }

    /**
     * Create a new position
     *
     * Validates that the session exists and user owns it before creating the position.
     * Business logic validations are handled by validatePositionCreation.
     *
     * @param position - Position creation data
     * @param user - User entity making the request (for authorization)
     * @returns Created position entity
     * @throws NotFoundError if session doesn't exist
     * @throws ForbiddenError if user doesn't own session and isn't admin
     * @throws BadRequestError if validation fails
     */
    async createPosition(
        position: PositionCreateInput,
        user: User
    ): Promise<Position> {
        // Validate business rules
        this.validatePositionCreation(position);

        // Validate that session exists and user has access
        // session_id is guaranteed to be defined after validatePositionCreation
        if (!position.session_id) {
            throw new BadRequestError("session_id is required");
        }
        // This will throw if session doesn't exist or user doesn't have access
        await sessionsService.getSessionById(
            position.session_id.toString(),
            user
        );

        this.logger.trace(
            { session_id: position.session_id, user_id: user.id },
            "Creating position"
        );

        const created = await positionsRepo.createPosition(position);
        this.logger.debug({ id: created.id }, "Position created");
        await positionsCacheRepo.cachePosition(created.id, created);
        this.logger.trace({ id: created.id }, "Position cached");
        return created;
    }

    /**
     * Update an existing position
     *
     * @param id - Position ID
     * @param position - Position update data
     * @param user - User entity making the request (for authorization)
     * @returns Updated position entity
     * @throws NotFoundError if position doesn't exist
     * @throws ForbiddenError if user doesn't own the session and isn't admin
     * @throws BadRequestError if validation fails
     */
    async updatePosition(
        id: string,
        position: PositionUpdateInput,
        user: User
    ): Promise<Position> {
        const existing = await positionsRepo.getPositionById(id);
        if (!existing) {
            this.logger.debug(
                { id },
                "Position not found, throwing not found error"
            );
            throw new NotFoundError("Position not found");
        }

        // Check session ownership - this will throw if user doesn't have access or session doesn't exist
        await sessionsService.getSessionById(
            existing.session_id.toString(),
            user
        );

        // Validate business rules
        this.validatePositionUpdateBusinessRules(position, existing, id);

        const updated = await positionsRepo.updatePosition(id, position);
        this.logger.debug({ id: updated.id }, "Position updated");
        const numericId = Number(id);
        await positionsCacheRepo.cachePosition(numericId, updated);
        this.logger.trace({ id: updated.id }, "Position cached");
        return updated;
    }

    /**
     * Delete a position
     *
     * @param id - Position ID
     * @param user - User entity making the request (for authorization)
     * @throws NotFoundError if position doesn't exist
     * @throws ForbiddenError if user doesn't own the session and isn't admin
     */
    async deletePosition(id: string, user: User): Promise<void> {
        const existing = await positionsRepo.getPositionById(id);
        if (!existing) {
            this.logger.debug(
                { id },
                "Position not found, throwing not found error"
            );
            throw new NotFoundError("Position not found");
        }

        // Check session ownership - this will throw if user doesn't have access or session doesn't exist
        await sessionsService.getSessionById(
            existing.session_id.toString(),
            user
        );

        await positionsRepo.deletePosition(id);
        this.logger.debug({ id }, "Position deleted");
        const numericId = Number(id);
        await positionsCacheRepo.invalidateCachedPosition(numericId);
        this.logger.trace({ id }, "Position invalidated from cache");
    }
}

export default new PositionsService();
