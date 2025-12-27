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
import ForbiddenError from "../../errors/web/forbidden-error";
import sessionsService from "./sessions-service";

/**
 * Valid position statuses for search operations
 */
const VALID_POSITION_STATUSES = ["OPEN", "CLOSED", "LIQUIDATED"] as const;

/**
 * Valid position sides for search operations
 */
const VALID_SIDES = ["BUY", "SELL"] as const;

/**
 * Valid sortable fields for positions
 */
const VALID_SORT_FIELDS = [
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

/**
 * Positions Service
 *
 * Handles business logic for position operations including CRUD, validation, and caching.
 * Positions represent trading positions within a session.
 */
class PositionsService {
    private readonly logger: ReturnType<typeof logger.child>;

    constructor() {
        this.logger = logger.child({
            service: "positions-service",
        });
    }

    // ============================================================================
    // VALIDATION METHODS
    // ============================================================================

    /**
     * Validate that session_id is provided
     *
     * @param sessionId - Session ID to validate
     * @throws BadRequestError if session_id is missing
     */
    private validateSessionId(sessionId: number | undefined | null): void {
        if (!sessionId) {
            throw new BadRequestError("session_id is required");
        }
    }

    /**
     * Validate that side is provided
     *
     * @param side - Side to validate
     * @throws BadRequestError if side is missing
     */
    private validateSide(side: string | undefined | null): void {
        if (!side) {
            throw new BadRequestError("side is required");
        }
    }

    /**
     * Validate that entry_price is provided and positive
     *
     * @param entryPrice - Entry price to validate
     * @throws BadRequestError if entry_price is invalid
     */
    private validateEntryPrice(entryPrice: number | undefined | null): void {
        if (!entryPrice || entryPrice <= 0) {
            throw new BadRequestError(
                "entry_price is required and must be positive"
            );
        }
    }

    /**
     * Validate that quantity_lots is provided and positive
     *
     * @param quantityLots - Quantity in lots to validate
     * @throws BadRequestError if quantity_lots is invalid
     */
    private validateQuantityLots(
        quantityLots: number | undefined | null
    ): void {
        if (!quantityLots || quantityLots <= 0) {
            throw new BadRequestError(
                "quantity_lots is required and must be positive"
            );
        }
    }

    /**
     * Validate that opened_at is provided
     *
     * @param openedAt - Opened timestamp to validate
     * @throws BadRequestError if opened_at is missing
     */
    private validateOpenedAt(openedAt: string | undefined | null): void {
        if (!openedAt) {
            throw new BadRequestError("opened_at is required");
        }
    }

    /**
     * Validate that a price field is positive if provided
     *
     * @param price - Price to validate
     * @param fieldName - Name of the field for error message
     * @throws BadRequestError if price is invalid
     */
    private validateOptionalPrice(
        price: number | undefined | null,
        fieldName: string
    ): void {
        if (price !== undefined && price !== null && price <= 0) {
            throw new BadRequestError(
                `${fieldName} must be positive if provided`
            );
        }
    }

    /**
     * Validate that a cost field is non-negative if provided
     *
     * @param cost - Cost to validate
     * @param fieldName - Name of the field for error message
     * @throws BadRequestError if cost is negative
     */
    private validateOptionalCost(
        cost: number | undefined | null,
        fieldName: string
    ): void {
        if (cost !== undefined && cost !== null && cost < 0) {
            throw new BadRequestError(`${fieldName} must be non-negative`);
        }
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

        // Invalid transitions from terminal states
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
     * Validate position status on creation
     *
     * @param positionStatus - Position status to validate
     * @throws BadRequestError if position is created with closed status
     */
    private validatePositionStatusOnCreation(
        positionStatus: string | undefined | null
    ): void {
        if (positionStatus) {
            if (
                positionStatus === "CLOSED" ||
                positionStatus === "LIQUIDATED"
            ) {
                throw new BadRequestError(
                    "Positions must be created with status OPEN. Use update operation to close positions."
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
        this.validateSessionId(position.session_id);
        this.validateSide(position.side);
        this.validateEntryPrice(position.entry_price);
        this.validateQuantityLots(position.quantity_lots);
        this.validateOpenedAt(position.opened_at);
        this.validateOptionalPrice(position.tp_price, "tp_price");
        this.validateOptionalPrice(position.sl_price, "sl_price");
        this.validatePositionStatusOnCreation(position.position_status);
    }

    /**
     * Validate all business rules for position update
     *
     * @param position - Position update data
     * @param existing - Existing position entity
     * @param positionId - Position ID for logging
     * @throws BadRequestError if validation fails
     */
    private validatePositionUpdate(
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
        this.validateOptionalPrice(position.exit_price, "exit_price");
        this.validateOptionalPrice(position.tp_price, "tp_price");
        this.validateOptionalPrice(position.sl_price, "sl_price");

        // Validate cost fields are non-negative
        this.validateOptionalCost(position.commission_cost, "commission_cost");
        this.validateOptionalCost(position.slippage_cost, "slippage_cost");
        this.validateOptionalCost(position.spread_cost, "spread_cost");
    }

    // ============================================================================
    // AUTHORIZATION METHODS
    // ============================================================================

    /**
     * Check if user can access a position via its session
     *
     * @param sessionId - Session ID to check
     * @param user - User entity making the request
     * @throws NotFoundError if session doesn't exist
     * @throws ForbiddenError if user doesn't own session and isn't admin
     */
    private async ensureSessionAccess(
        sessionId: number,
        user: User
    ): Promise<void> {
        await sessionsService.getSessionById(sessionId.toString(), user);
    }

    /**
     * Verify user has access to a position without throwing
     *
     * Used for filtering lists of positions. Returns true if user has access,
     * false otherwise. Logs access denials for security auditing.
     *
     * @param position - Position entity to check access for
     * @param user - User entity making the request
     * @returns true if user has access, false otherwise
     */
    private async verifyPositionAccess(
        position: Position,
        user: User
    ): Promise<boolean> {
        try {
            await this.ensureSessionAccess(position.session_id, user);
            return true;
        } catch (error) {
            const reason =
                error instanceof NotFoundError
                    ? "session not found"
                    : error instanceof ForbiddenError
                      ? "user does not own session"
                      : "unknown error";

            this.logger.debug(
                {
                    positionId: position.id,
                    sessionId: position.session_id,
                    userId: user.id,
                    userRole: user.role,
                    reason,
                },
                "Position access denied"
            );

            return false;
        }
    }

    // ============================================================================
    // CACHE METHODS
    // ============================================================================

    /**
     * Get position from cache with access verification
     *
     * @param numericId - Numeric position ID
     * @param user - User entity making the request
     * @returns Cached position or null if not found or access denied
     */
    private async getCachedPositionWithAccess(
        numericId: number,
        user: User
    ): Promise<Position | null> {
        const cachedPosition =
            await positionsCacheRepo.getCachedPosition(numericId);
        if (!cachedPosition) {
            return null;
        }

        this.logger.trace({ id: numericId }, "Position found in cache");

        try {
            await this.ensureSessionAccess(cachedPosition.session_id, user);
            return cachedPosition;
        } catch (error) {
            // If ForbiddenError, user doesn't have access - throw immediately
            // If NotFoundError, session doesn't exist - invalidate cache and return null
            await positionsCacheRepo.invalidateCachedPosition(numericId);
            if (!(error instanceof NotFoundError)) {
                throw error;
            }
            // If NotFoundError, return null to fetch from DB
            return null;
        }
    }

    /**
     * Cache a position after retrieval
     *
     * @param position - Position entity to cache
     */
    private async cachePosition(position: Position): Promise<void> {
        await positionsCacheRepo.cachePosition(position.id, position);
        this.logger.trace({ id: position.id }, "Position cached");
    }

    /**
     * Invalidate a cached position
     *
     * @param numericId - Numeric position ID
     */
    private async invalidateCachedPosition(numericId: number): Promise<void> {
        await positionsCacheRepo.invalidateCachedPosition(numericId);
        this.logger.trace({ id: numericId }, "Position invalidated from cache");
    }

    /**
     * Filter positions by access rights
     *
     * Verifies access for each position in parallel and filters out
     * inaccessible ones. Logs filtered positions for security auditing.
     *
     * @param positions - Array of positions to filter
     * @param user - User entity making the request
     * @returns Array of accessible positions
     */
    private async filterPositionsByAccess(
        positions: Position[],
        user: User
    ): Promise<Position[]> {
        if (positions.length === 0) {
            return positions;
        }

        // Verify access for all positions in parallel
        const accessResults = await Promise.all(
            positions.map((position) =>
                this.verifyPositionAccess(position, user)
            )
        );

        // Filter positions based on access results
        const accessiblePositions: Position[] = [];
        let filteredCount = 0;

        positions.forEach((position, index) => {
            if (accessResults[index]) {
                accessiblePositions.push(position);
            } else {
                filteredCount++;
            }
        });

        // Log if any positions were filtered out
        if (filteredCount > 0) {
            this.logger.debug(
                {
                    userId: user.id,
                    userRole: user.role,
                    totalPositions: positions.length,
                    filteredCount,
                    accessibleCount: accessiblePositions.length,
                },
                "Positions filtered by access rights"
            );
        }

        return accessiblePositions;
    }

    // ============================================================================
    // QUERY BUILDING METHODS
    // ============================================================================

    /**
     * Build session filter for position queries
     *
     * @param sessionId - Optional session ID to filter by
     * @param user - User entity making the request
     * @returns Where clause for session filtering
     * @throws NotFoundError if session doesn't exist
     * @throws ForbiddenError if user doesn't own session and isn't admin
     */
    private async buildSessionFilter(
        sessionId: string | undefined,
        user: User
    ): Promise<PositionWhereInput> {
        if (sessionId) {
            const numericSessionId = Number(sessionId);
            await this.ensureSessionAccess(numericSessionId, user);
            return { session_id: { equals: numericSessionId } };
        }

        // Get all sessions for the user
        const userSessions = await sessionsService.getAllSessions(
            user.role === "ADMIN" ? undefined : user.id
        );
        const sessionIds = userSessions.map((s) => s.id);

        if (sessionIds.length === 0) {
            // User has no sessions - return filter that matches nothing
            return { session_id: { in: [] } };
        }

        return { session_id: { in: sessionIds } };
    }

    /**
     * Build search conditions for position queries
     *
     * @param searchQuery - Search query string
     * @returns Array of search conditions or empty array
     */
    private buildSearchConditions(searchQuery: string): PositionWhereInput[] {
        const searchConditions: PositionWhereInput[] = [];
        const upperQ = searchQuery.toUpperCase();

        // Try to match position_status
        if (
            VALID_POSITION_STATUSES.includes(
                upperQ as (typeof VALID_POSITION_STATUSES)[number]
            )
        ) {
            searchConditions.push({
                position_status: {
                    equals: upperQ as (typeof VALID_POSITION_STATUSES)[number],
                },
            });
        }

        // Try to match side
        if (VALID_SIDES.includes(upperQ as (typeof VALID_SIDES)[number])) {
            searchConditions.push({
                side: { equals: upperQ as (typeof VALID_SIDES)[number] },
            });
        }

        return searchConditions;
    }

    /**
     * Combine session filter with search conditions
     *
     * @param sessionFilter - Session filter where clause
     * @param searchConditions - Search conditions array
     * @returns Combined where clause
     */
    private combineFiltersWithSearch(
        sessionFilter: PositionWhereInput,
        searchConditions: PositionWhereInput[]
    ): PositionWhereInput {
        if (searchConditions.length === 0) {
            return sessionFilter;
        }

        const hasSessionFilter = sessionFilter.session_id !== undefined;

        if (hasSessionFilter) {
            return {
                AND: [
                    { session_id: sessionFilter.session_id },
                    { OR: searchConditions },
                ],
            };
        }

        return { OR: searchConditions };
    }

    /**
     * Build order by clause for position queries
     *
     * @param sort - Sort field name
     * @param order - Sort order ("asc" or "desc")
     * @returns Order by clause or undefined
     */
    private buildOrderBy(
        sort: string | undefined,
        order: "asc" | "desc"
    ): PositionOrderBy | undefined {
        if (
            !sort ||
            !VALID_SORT_FIELDS.includes(
                sort as (typeof VALID_SORT_FIELDS)[number]
            )
        ) {
            return undefined;
        }

        return { [sort]: order } as PositionOrderBy;
    }

    // ============================================================================
    // PUBLIC METHODS
    // ============================================================================

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

        // Try to get from cache first
        const cachedPosition = await this.getCachedPositionWithAccess(
            numericId,
            user
        );
        if (cachedPosition) {
            return cachedPosition;
        }

        // Fetch from database
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

        // Verify access
        await this.ensureSessionAccess(position.session_id, user);

        // Cache and return
        await this.cachePosition(position);
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

        // Build session filter
        const sessionFilter = await this.buildSessionFilter(sessionId, user);

        // Handle empty filter case (user has no sessions)
        if (sessionFilter.session_id && "in" in sessionFilter.session_id) {
            const sessionIds = sessionFilter.session_id.in;
            if (sessionIds?.length === 0) {
                return [];
            }
        }

        // Build search conditions
        const searchConditions = q ? this.buildSearchConditions(q) : [];

        // Combine filters
        const where = this.combineFiltersWithSearch(
            sessionFilter,
            searchConditions
        );

        // Build order by
        const orderBy = this.buildOrderBy(sort, order);

        // Execute query
        const positions = await positionsRepo.getAllPositions({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy,
        });

        return this.filterPositionsByAccess(positions, user);
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

        // Validate session access (session_id is guaranteed after validation)
        await this.ensureSessionAccess(position.session_id as number, user);

        this.logger.trace(
            { session_id: position.session_id, user_id: user.id },
            "Creating position"
        );

        const created = await positionsRepo.createPosition(position);
        this.logger.debug({ id: created.id }, "Position created");

        await this.cachePosition(created);
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

        // Check session access
        await this.ensureSessionAccess(existing.session_id, user);

        // Validate business rules
        this.validatePositionUpdate(position, existing, id);

        const updated = await positionsRepo.updatePosition(id, position);
        this.logger.debug({ id: updated.id }, "Position updated");

        await this.cachePosition(updated);
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

        // Check session access
        await this.ensureSessionAccess(existing.session_id, user);

        await positionsRepo.deletePosition(id);
        this.logger.debug({ id }, "Position deleted");

        await this.invalidateCachedPosition(Number(id));
    }
}

export default new PositionsService();
