import {
    sessionsRepo,
    instrumentsRepo,
    subscriptionsRepo,
    plansRepo,
    usersRepo,
    candlesRepo,
} from "@backtrade/data";
import {
    SESSION_STATUS_VALUES,
    type Session,
    type SessionWhereInput,
    type SessionCreateInput,
    type SessionUpdateInput,
    type SessionOrderBy,
    type SearchQuery,
    type User,
    type SessionStatus,
    type Timeframe,
    type Candle,
} from "@backtrade/types";
import { sessionsCacheRepo } from "../../libs/cache";
import NotFoundError from "../../errors/web/not-found-error";
import BadRequestError from "../../errors/web/bad-request-error";
import ForbiddenError from "../../errors/web/forbidden-error";
import barAdvancementService from "../trading/bar-advancement-service";
import { BaseService } from "./base-service";
import { buildOrderBy, buildPagination } from "../../utils";
import { PAGINATION_CONSTANTS } from "../../config/trading-constants";

/**
 * Valid session statuses for search operations
 * Uses enum values from @backtrade/types for consistency
 */
const VALID_SESSION_STATUSES = SESSION_STATUS_VALUES;

/**
 * Valid sortable fields for sessions
 */
const VALID_SORT_FIELDS = [
    "id",
    "user_id",
    "instrument_id",
    "name",
    "session_status",
    "speed",
    "start_time",
    "current_time",
    "end_time",
    "initial_balance",
    "current_balance",
    "leverage",
    "created_at",
    "updated_at",
] as const;

type SessionSortField = (typeof VALID_SORT_FIELDS)[number];

/**
 * Sessions Service
 *
 * Handles business logic for session operations including CRUD, validation, and caching.
 * Sessions represent trading simulation instances owned by users.
 */
class SessionsService extends BaseService {
    constructor() {
        super("sessions-service");
    }

    // ============================================================================
    // VALIDATION METHODS
    // ============================================================================

    /**
     * Validate that instrument_id is provided
     *
     * @param instrumentId - Instrument ID to validate
     * @throws BadRequestError if instrument_id is missing
     */
    private validateInstrumentId(
        instrumentId: number | undefined | null
    ): void {
        if (!instrumentId) {
            throw new BadRequestError("instrument_id is required");
        }
    }

    /**
     * Validate that user_id is provided
     *
     * @param userId - User ID to validate
     * @throws BadRequestError if user_id is missing
     */
    private validateUserId(userId: number | undefined | null): void {
        if (!userId) {
            throw new BadRequestError("user_id is required");
        }
    }

    /**
     * Validate that current_time is greater than or equal to start_time
     *
     * @param currentTime - Current time to validate
     * @param startTime - Session start time
     * @param sessionId - Session ID for logging
     * @throws BadRequestError if current_time < start_time
     */
    private validateCurrentTimeAgainstStartTime(
        currentTime: Date,
        startTime: Date,
        sessionId: string
    ): void {
        if (currentTime < startTime) {
            this.logger.debug(
                {
                    id: sessionId,
                    current_time: currentTime.toISOString(),
                    start_time: startTime.toISOString(),
                },
                "current_time validation failed: must be >= start_time"
            );
            throw new BadRequestError(
                "current_time must be greater than or equal to start_time"
            );
        }
    }

    /**
     * Validate that current_time is less than or equal to end_time
     *
     * @param currentTime - Current time to validate
     * @param endTime - Session end time
     * @param sessionId - Session ID for logging
     * @throws BadRequestError if current_time > end_time
     */
    private validateCurrentTimeAgainstEndTime(
        currentTime: Date,
        endTime: Date,
        sessionId: string
    ): void {
        if (currentTime > endTime) {
            this.logger.debug(
                {
                    id: sessionId,
                    current_time: currentTime.toISOString(),
                    end_time: endTime.toISOString(),
                },
                "current_time validation failed: must be <= end_time"
            );
            throw new BadRequestError(
                "current_time must be less than or equal to end_time"
            );
        }
    }

    /**
     * Validate that end_time is greater than or equal to start_time
     *
     * @param endTime - End time to validate
     * @param startTime - Session start time
     * @param sessionId - Session ID for logging
     * @throws BadRequestError if end_time < start_time
     */
    private validateEndTimeAgainstStartTime(
        endTime: Date,
        startTime: Date,
        sessionId: string
    ): void {
        if (endTime < startTime) {
            this.logger.debug(
                {
                    id: sessionId,
                    end_time: endTime.toISOString(),
                    start_time: startTime.toISOString(),
                },
                "end_time validation failed: must be >= start_time"
            );
            throw new BadRequestError(
                "end_time must be greater than or equal to start_time"
            );
        }
    }

    /**
     * Validate that end_time is greater than or equal to current_time
     *
     * @param endTime - End time to validate
     * @param currentTime - Session current time
     * @param sessionId - Session ID for logging
     * @throws BadRequestError if end_time < current_time
     */
    private validateEndTimeAgainstCurrentTime(
        endTime: Date,
        currentTime: Date,
        sessionId: string
    ): void {
        if (endTime < currentTime) {
            this.logger.debug(
                {
                    id: sessionId,
                    end_time: endTime.toISOString(),
                    current_time: currentTime.toISOString(),
                },
                "end_time validation failed: must be >= current_time"
            );
            throw new BadRequestError(
                "end_time must be greater than or equal to current_time"
            );
        }
    }

    /**
     * Validate that the referenced instrument exists
     *
     * @param instrumentId - Instrument ID to validate
     * @throws NotFoundError if instrument doesn't exist
     */
    private async validateInstrumentExists(
        instrumentId: number
    ): Promise<void> {
        const instrument =
            await instrumentsRepo.getInstrumentById(instrumentId);
        if (!instrument) {
            this.logger.debug(
                { instrument_id: instrumentId },
                "Instrument not found when creating session"
            );
            throw new NotFoundError(
                `Instrument with ID ${instrumentId} not found`
            );
        }
    }

    /**
     * Validate all business rules for session creation
     *
     * Validates:
     * - Instrument exists
     * - User has not exceeded their active session limit based on subscription plan
     *   - Users without subscription: 1 active session
     *   - TRADER plan: 10 active sessions
     *   - EXPERT plan: 30 active sessions
     * - Admin users bypass session limits
     *
     * @param session - Session creation data
     * @throws BadRequestError if validation fails or session limit reached
     * @throws NotFoundError if instrument doesn't exist
     */
    private async validateSessionCreation(
        session: SessionCreateInput
    ): Promise<void> {
        this.validateInstrumentId(session.instrument_id);
        this.validateUserId(session.user_id);
        // instrument_id is guaranteed to be defined after validateInstrumentId
        await this.validateInstrumentExists(session.instrument_id as number);

        // Validate session limit based on user's subscription plan
        await this.validateSessionLimit(session.user_id as number);
    }

    /**
     * Validate that user has not exceeded their active session limit
     *
     * Active sessions are those with session_status not equal to ARCHIVED.
     * Admin users bypass this limit check.
     *
     * @param userId - User ID to validate
     * @throws BadRequestError if user has reached their session limit
     */
    private async validateSessionLimit(userId: number): Promise<void> {
        // Get user to check if admin (admins bypass limits)
        const user = await usersRepo.getUserById(userId);
        if (!user) {
            this.logger.debug(
                { userId },
                "User not found during session limit validation"
            );
            throw new BadRequestError("User not found");
        }

        // Admin users bypass session limits
        if (user.role === "ADMIN") {
            this.logger.trace(
                { userId },
                "Admin user bypassing session limit check"
            );
            return;
        }

        // Get user's active subscription
        const subscription =
            await subscriptionsRepo.getActiveSubscriptionByUserId(userId);

        // Determine max active sessions limit
        let maxActiveSessions: number;
        let planName: string;

        if (subscription) {
            // User has active subscription - get plan details
            const plan = await plansRepo.getPlanById(subscription.plan_id);
            if (!plan) {
                this.logger.warn(
                    {
                        userId,
                        subscriptionId: subscription.id,
                        planId: subscription.plan_id,
                    },
                    "Plan not found for active subscription"
                );
                // Fallback to default limit if plan not found
                maxActiveSessions = 1;
                planName = "free";
            } else {
                maxActiveSessions = plan.max_active_sessions;
                planName = plan.code;
            }
        } else {
            // User has no active subscription - use default limit
            maxActiveSessions = 1;
            planName = "free";
        }

        // Count user's current active sessions
        const activeSessionCount =
            await sessionsRepo.countActiveSessionsByUserId(userId);

        // Check if limit is reached
        if (activeSessionCount >= maxActiveSessions) {
            this.logger.debug(
                {
                    userId,
                    activeSessionCount,
                    maxActiveSessions,
                    planName,
                },
                "User has reached active session limit"
            );

            const sessionWord =
                maxActiveSessions === 1 ? "session" : "sessions";
            throw new BadRequestError(
                `You have reached your maximum active sessions limit (${maxActiveSessions} ${sessionWord} for ${planName} plan)`
            );
        }

        this.logger.trace(
            {
                userId,
                activeSessionCount,
                maxActiveSessions,
                planName,
            },
            "Session limit validation passed"
        );
    }

    /**
     * Validate all business rules for session update
     *
     * Validates:
     * - current_time >= start_time (if current_time is provided)
     * - current_time <= end_time (if both current_time and end_time exist)
     * - end_time >= start_time (if end_time is provided)
     * - end_time >= current_time (if end_time is provided and current_time exists)
     *
     * @param session - Session update data
     * @param existing - Existing session entity
     * @param sessionId - Session ID for logging
     * @throws BadRequestError if any validation fails
     */
    private validateSessionUpdate(
        session: SessionUpdateInput,
        existing: Session,
        sessionId: string
    ): void {
        const startTime = new Date(existing.start_time);

        // Validate current_time if provided
        if (session.current_time !== undefined) {
            const currentTime = new Date(session.current_time);

            // Validate current_time >= start_time
            this.validateCurrentTimeAgainstStartTime(
                currentTime,
                startTime,
                sessionId
            );

            // If existing end_time exists, validate current_time <= end_time
            if (existing.end_time) {
                const endTime = new Date(existing.end_time);
                this.validateCurrentTimeAgainstEndTime(
                    currentTime,
                    endTime,
                    sessionId
                );
            }
        }

        // Validate end_time if provided
        if (session.end_time !== undefined && session.end_time !== null) {
            const endTime = new Date(session.end_time);

            // Validate end_time >= start_time
            this.validateEndTimeAgainstStartTime(endTime, startTime, sessionId);

            // Validate end_time against current_time
            if (session.current_time !== undefined) {
                // If current_time is being updated, validate against new current_time
                const currentTime = new Date(session.current_time);
                this.validateEndTimeAgainstCurrentTime(
                    endTime,
                    currentTime,
                    sessionId
                );
            } else {
                // If current_time is not being updated, validate against existing current_time
                const currentTime = new Date(existing.current_time);
                this.validateEndTimeAgainstCurrentTime(
                    endTime,
                    currentTime,
                    sessionId
                );
            }
        }
    }

    // ============================================================================
    // AUTHORIZATION METHODS
    // ============================================================================

    /**
     * Ensure that the user owns the session or is an admin
     *
     * This method is public because it's used by other services (Positions, Transactions)
     * to verify session ownership.
     *
     * @param session - Session entity to check ownership
     * @param user - User entity making the request
     * @throws ForbiddenError if user doesn't own session and isn't admin
     */
    public ensureSessionOwnershipOrAdmin(session: Session, user: User): void {
        if (session.user_id !== user.id && user.role !== "ADMIN") {
            this.logger.debug(
                {
                    sessionId: session.id,
                    sessionUserId: session.user_id,
                    requestUserId: user.id,
                    userRole: user.role,
                },
                "User attempted to access session they don't own"
            );
            throw new ForbiddenError(
                "You don't have permission to access this session"
            );
        }
    }

    /**
     * Verify user has access to a session without throwing
     *
     * Used for filtering lists of sessions. Returns true if user has access,
     * false otherwise.
     *
     * @param session - Session entity to check access for
     * @param user - User entity making the request
     * @returns true if user has access, false otherwise
     */
    private verifySessionAccess(session: Session, user: User): boolean {
        if (session.user_id === user.id || user.role === "ADMIN") {
            return true;
        }

        this.logger.debug(
            {
                sessionId: session.id,
                sessionUserId: session.user_id,
                requestUserId: user.id,
                userRole: user.role,
            },
            "Session access denied during filtering"
        );

        return false;
    }

    // ============================================================================
    // CACHE METHODS
    // ============================================================================

    /**
     * Get session from cache with access verification
     *
     * @param numericId - Numeric session ID
     * @param user - User entity making the request
     * @returns Cached session or null if not found or access denied
     */
    private async getCachedSessionWithAccess(
        numericId: number,
        user: User
    ): Promise<Session | null> {
        const cachedSession =
            await sessionsCacheRepo.getCachedSession(numericId);
        if (!cachedSession) {
            return null;
        }

        this.logger.trace({ id: numericId }, "Session found in cache");

        // Verify access - throws ForbiddenError if denied
        this.ensureSessionOwnershipOrAdmin(cachedSession, user);
        return cachedSession;
    }

    /**
     * Cache a session after retrieval
     *
     * @param session - Session entity to cache
     */
    private async cacheSession(session: Session): Promise<void> {
        await sessionsCacheRepo.cacheSession(session.id, session);
        this.logger.trace({ id: session.id }, "Session cached");
    }

    /**
     * Invalidate a cached session
     *
     * @param numericId - Numeric session ID
     */
    private async invalidateCachedSession(numericId: number): Promise<void> {
        await sessionsCacheRepo.invalidateCachedSession(numericId);
        this.logger.trace({ id: numericId }, "Session invalidated from cache");
    }

    /**
     * Filter sessions by access rights
     *
     * Filters out sessions the user doesn't have access to.
     * Logs filtered sessions for security auditing.
     *
     * @param sessions - Array of sessions to filter
     * @param user - User entity making the request
     * @returns Array of accessible sessions
     */
    private filterSessionsByAccess(sessions: Session[], user: User): Session[] {
        if (sessions.length === 0) {
            return sessions;
        }

        const accessibleSessions: Session[] = [];
        let filteredCount = 0;

        for (const session of sessions) {
            if (this.verifySessionAccess(session, user)) {
                accessibleSessions.push(session);
            } else {
                filteredCount++;
            }
        }

        // Log if any sessions were filtered out
        if (filteredCount > 0) {
            this.logger.debug(
                {
                    userId: user.id,
                    userRole: user.role,
                    totalSessions: sessions.length,
                    filteredCount,
                    accessibleCount: accessibleSessions.length,
                },
                "Sessions filtered by access rights"
            );
        }

        return accessibleSessions;
    }

    // ============================================================================
    // QUERY BUILDING METHODS
    // ============================================================================

    /**
     * Build user filter for session queries
     *
     * @param userId - Optional user ID to filter by
     * @returns Where clause for user filtering
     */
    private buildUserFilter(userId?: number): SessionWhereInput {
        if (userId) {
            return { user_id: { equals: userId } };
        }
        return {};
    }

    /**
     * Build search conditions for session queries
     *
     * @param searchQuery - Search query string
     * @returns Array of search conditions or empty array
     */
    private buildSearchConditions(searchQuery: string): SessionWhereInput[] {
        const searchConditions: SessionWhereInput[] = [];

        // Search by name (case-insensitive)
        searchConditions.push({
            name: { contains: searchQuery, mode: "insensitive" as const },
        });

        // Search by session_status if it matches
        const upperQ = searchQuery.toUpperCase();
        if (VALID_SESSION_STATUSES.includes(upperQ as SessionStatus)) {
            searchConditions.push({
                session_status: {
                    equals: upperQ as SessionStatus,
                },
            });
        }

        return searchConditions;
    }

    /**
     * Combine user filter with search conditions
     *
     * @param userFilter - User filter where clause
     * @param searchConditions - Search conditions array
     * @returns Combined where clause
     */
    private combineFiltersWithSearch(
        userFilter: SessionWhereInput,
        searchConditions: SessionWhereInput[]
    ): SessionWhereInput {
        if (searchConditions.length === 0) {
            return userFilter;
        }

        const hasUserFilter = userFilter.user_id !== undefined;

        if (hasUserFilter) {
            return {
                AND: [
                    { user_id: userFilter.user_id },
                    { OR: searchConditions },
                ],
            };
        }

        return { OR: searchConditions };
    }

    // ============================================================================
    // PUBLIC METHODS
    // ============================================================================

    /**
     * Get a session by ID with caching
     *
     * @param id - Session ID
     * @param user - User entity making the request (for authorization)
     * @returns Session entity
     * @throws NotFoundError if session doesn't exist
     * @throws ForbiddenError if user doesn't own session and isn't admin
     */
    async getSessionById(id: string, user: User): Promise<Session> {
        const numericId = Number(id);

        // Try to get from cache first (includes access verification)
        const cachedSession = await this.getCachedSessionWithAccess(
            numericId,
            user
        );
        if (cachedSession) {
            return cachedSession;
        }

        // Fetch from database
        this.logger.trace(
            { id },
            "Session not found in cache, fetching from database"
        );
        const session = await sessionsRepo.getSessionById(id);
        if (!session) {
            this.logger.debug(
                { id },
                "Session not found, throwing not found error"
            );
            throw new NotFoundError("Session not found");
        }

        // Verify access
        this.ensureSessionOwnershipOrAdmin(session, user);

        // Cache and return
        await this.cacheSession(session);
        return session;
    }

    /**
     * Get all sessions with optional search and pagination
     *
     * @param userId - User ID to filter sessions by (required for user-scoped queries)
     * @param query - Optional search query with pagination and sorting
     * @returns Array of session entities
     */
    async getAllSessions(
        userId?: number,
        query?: SearchQuery
    ): Promise<Session[]> {
        const {
            q,
            page = PAGINATION_CONSTANTS.DEFAULT_PAGE,
            limit = PAGINATION_CONSTANTS.DEFAULT_PAGE_LIMIT,
            sort,
            order = "desc",
        } = query ?? {};

        // Build user filter
        const userFilter = this.buildUserFilter(userId);

        // Build search conditions
        const searchConditions = q ? this.buildSearchConditions(q) : [];

        // Combine filters
        const where = this.combineFiltersWithSearch(
            userFilter,
            searchConditions
        );

        // Build order by using shared utility
        const orderBy = buildOrderBy<SessionSortField>(
            sort,
            order,
            VALID_SORT_FIELDS
        ) as SessionOrderBy | undefined;

        // Build pagination using shared utility
        const { skip, take } = buildPagination(page, limit);

        // Execute query
        return sessionsRepo.findSessions({
            where,
            skip,
            take,
            orderBy,
        });
    }

    /**
     * Create a new session
     *
     * Validates that the instrument exists before creating the session.
     * Business logic validations (start_time <= end_time, current_time = start_time)
     * are handled by the request schema validation.
     *
     * @param session - Session creation data (must include instrument_id, user_id, and other required fields)
     * @returns Created session entity
     * @throws NotFoundError if instrument doesn't exist
     * @throws BadRequestError if required fields are missing
     */
    async createSession(session: SessionCreateInput): Promise<Session> {
        // Validate business rules
        await this.validateSessionCreation(session);

        this.logger.trace(
            { instrument_id: session.instrument_id, user_id: session.user_id },
            "Creating session"
        );

        const created = await sessionsRepo.createSession(session);
        this.logger.debug({ id: created.id }, "Session created");

        await this.cacheSession(created);
        return created;
    }

    /**
     * Update an existing session
     *
     * When current_time is advanced (moved forward), triggers bar advancement
     * processing to:
     * - Check TP/SL levels against M1 candle data
     * - Close positions that hit TP/SL
     * - Perform liquidation cascade if margin level drops below 50%
     *
     * @param id - Session ID
     * @param session - Session update data
     * @param user - User entity making the request (for authorization)
     * @returns Updated session entity
     * @throws NotFoundError if session doesn't exist
     * @throws ForbiddenError if user doesn't own session and isn't admin
     * @throws BadRequestError if validation fails
     */
    async updateSession(
        id: string,
        session: SessionUpdateInput,
        user: User
    ): Promise<Session> {
        const existing = await sessionsRepo.getSessionById(id);
        if (!existing) {
            this.logger.debug(
                { id },
                "Session not found, throwing not found error"
            );
            throw new NotFoundError("Session not found");
        }

        // Check authorization
        this.ensureSessionOwnershipOrAdmin(existing, user);

        // Validate business rules
        this.validateSessionUpdate(session, existing, id);

        // Process bar advancement if current_time is being advanced
        if (session.current_time !== undefined) {
            const oldTime = existing.current_time;
            const newTime = session.current_time;

            // Only process if time is moving forward
            if (new Date(newTime) > new Date(oldTime)) {
                this.logger.debug(
                    { id, oldTime, newTime },
                    "Bar advancement detected, processing positions"
                );

                // Fetch session with instrument for contract_size and other calculations
                const sessionWithInstrument =
                    await sessionsRepo.getSessionWithInstrument(id);

                if (sessionWithInstrument) {
                    try {
                        const result =
                            await barAdvancementService.processBarAdvancement(
                                sessionWithInstrument,
                                oldTime,
                                newTime,
                                user
                            );

                        this.logger.debug(
                            {
                                id,
                                positionsClosedCount:
                                    result.positionsClosed.length,
                                marginLevelAfter: result.marginLevelAfter,
                                equityAfter: result.equityAfter,
                            },
                            "Bar advancement processing complete"
                        );
                    } catch (error) {
                        this.logger.error(
                            {
                                id,
                                oldTime,
                                newTime,
                                error:
                                    error instanceof Error
                                        ? error.message
                                        : String(error),
                            },
                            "Bar advancement processing failed"
                        );
                        // Re-throw to prevent session update if bar processing fails
                        throw error;
                    }
                }
            }
        }

        const updated = await sessionsRepo.updateSession(id, session);
        this.logger.debug({ id: updated.id }, "Session updated");

        await this.cacheSession(updated);
        return updated;
    }

    /**
     * Delete a session
     *
     * @param id - Session ID
     * @param user - User entity making the request (for authorization)
     * @throws NotFoundError if session doesn't exist
     * @throws ForbiddenError if user doesn't own session and isn't admin
     */
    async deleteSession(id: string, user: User): Promise<void> {
        const existing = await sessionsRepo.getSessionById(id);
        if (!existing) {
            this.logger.debug(
                { id },
                "Session not found, throwing not found error"
            );
            throw new NotFoundError("Session not found");
        }

        // Check authorization
        this.ensureSessionOwnershipOrAdmin(existing, user);

        await sessionsRepo.deleteSession(id);
        this.logger.debug({ id }, "Session deleted");

        await this.invalidateCachedSession(Number(id));
    }

    /**
     * Skip to the next candle for a session
     *
     * Advances the session's current_time to the next candle timestamp for the specified timeframe,
     * processes bar advancement (TP/SL checks, liquidations), and returns the updated session
     * along with the new candle data.
     *
     * @param id - Session ID
     * @param timeframe - Timeframe to skip to (M1, M5, H1, etc.)
     * @param user - User entity making the request (for authorization)
     * @returns Object containing the updated session and the new candle
     * @throws NotFoundError if session doesn't exist
     * @throws ForbiddenError if user doesn't own session and isn't admin
     * @throws BadRequestError if timeframe is invalid or no next candle exists
     */
    async skipToNextCandle(
        id: string,
        timeframe: Timeframe,
        user: User
    ): Promise<{ session: Session; candle: Candle }> {
        const existing = await sessionsRepo.getSessionById(id);
        if (!existing) {
            this.logger.debug(
                { id },
                "Session not found, throwing not found error"
            );
            throw new NotFoundError("Session not found");
        }

        // Check authorization
        this.ensureSessionOwnershipOrAdmin(existing, user);

        // Get session with instrument for candle fetching
        const sessionWithInstrument =
            await sessionsRepo.getSessionWithInstrument(id);
        if (!sessionWithInstrument) {
            throw new NotFoundError("Session with instrument not found");
        }

        // Calculate the next candle timestamp based on timeframe
        // We need to find the next candle that starts after the current_time
        const currentTime = new Date(existing.current_time);

        // Find the next candle for the specified timeframe
        const nextCandle =
            await candlesRepo.getNextCandleByInstrumentAndTimeframe(
                sessionWithInstrument.instrument_id,
                timeframe,
                existing.current_time
            );

        if (!nextCandle) {
            // Check if we've reached the end_time
            if (existing.end_time) {
                const endTime = new Date(existing.end_time);
                if (currentTime.getTime() >= endTime.getTime()) {
                    throw new BadRequestError(
                        "Session has already reached its end time"
                    );
                }
            }
            throw new BadRequestError(
                `No next candle available for timeframe ${timeframe}`
            );
        }

        // Use the next candle's timestamp as the new current_time
        const newCurrentTime = nextCandle.ts;

        // Validate against session end_time boundary
        if (existing.end_time) {
            const endTime = new Date(existing.end_time);
            const nextCandleTime = new Date(newCurrentTime);
            if (nextCandleTime.getTime() > endTime.getTime()) {
                throw new BadRequestError(
                    "Next candle exceeds session end time"
                );
            }
        }

        this.logger.debug(
            {
                id,
                oldTime: existing.current_time,
                newTime: newCurrentTime,
                timeframe,
            },
            "Skipping to next candle"
        );

        // Process bar advancement if time is moving forward
        const oldTime = existing.current_time;
        if (new Date(newCurrentTime) > new Date(oldTime)) {
            try {
                const result =
                    await barAdvancementService.processBarAdvancement(
                        sessionWithInstrument,
                        oldTime,
                        newCurrentTime,
                        user
                    );

                this.logger.debug(
                    {
                        id,
                        positionsClosedCount: result.positionsClosed.length,
                        marginLevelAfter: result.marginLevelAfter,
                        equityAfter: result.equityAfter,
                    },
                    "Bar advancement processing complete"
                );
            } catch (error) {
                this.logger.error(
                    {
                        id,
                        oldTime,
                        newTime: newCurrentTime,
                        error:
                            error instanceof Error
                                ? error.message
                                : String(error),
                    },
                    "Bar advancement processing failed"
                );
                throw error;
            }
        }

        // Update session with new current_time
        const updated = await sessionsRepo.updateSession(id, {
            current_time: newCurrentTime,
        });
        this.logger.debug({ id: updated.id }, "Session updated after skip");

        await this.cacheSession(updated);

        return {
            session: updated,
            candle: nextCandle,
        };
    }
}

export default new SessionsService();
