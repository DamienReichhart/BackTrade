import { sessionsRepo, instrumentsRepo } from "@backtrade/data";
import type {
    Session,
    SessionWhereInput,
    SessionCreateInput,
    SessionUpdateInput,
    SessionOrderBy,
    SearchQuery,
    User,
} from "@backtrade/types";
import { sessionsCacheRepo } from "../../libs/cache";
import { logger } from "../../libs/pino";
import NotFoundError from "../../errors/web/not-found-error";
import BadRequestError from "../../errors/web/bad-request-error";
import ForbiddenError from "../../errors/web/forbidden-error";

/**
 * Sessions Service
 *
 * Handles business logic for session operations including CRUD and caching.
 */
class SessionsService {
    private readonly logger: ReturnType<typeof logger.child>;

    constructor() {
        this.logger = logger.child({
            service: "session-service",
        });
    }

    /**
     * Ensure that the user owns the session or is an admin
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
    private validateSessionUpdateBusinessRules(
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
        const cachedSession =
            await sessionsCacheRepo.getCachedSession(numericId);
        if (cachedSession) {
            this.logger.trace({ id }, "Session found in cache");
            this.ensureSessionOwnershipOrAdmin(cachedSession, user);
            return cachedSession;
        }
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
        this.ensureSessionOwnershipOrAdmin(session, user);
        await sessionsCacheRepo.cacheSession(numericId, session);
        this.logger.trace({ id }, "Session cached");
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
        const { q, page = 1, limit = 20, sort, order = "desc" } = query ?? {};

        // Build where clause
        const where: SessionWhereInput = {};

        // Filter by user_id if provided
        if (userId) {
            where.user_id = { equals: userId };
        }

        // Add search query if provided
        // Use AND to combine user_id filter with search OR clause
        if (q) {
            const searchConditions: SessionWhereInput[] = [
                { name: { contains: q, mode: "insensitive" as const } },
                // Add more searchable fields as needed
            ];

            if (userId) {
                // If user_id is set, combine it with search using AND
                where.AND = [
                    { user_id: { equals: userId } },
                    { OR: searchConditions },
                ];
                // Remove user_id from top level since it's now in AND
                delete where.user_id;
            } else {
                where.OR = searchConditions;
            }
        }

        // Validate sort parameter against valid Session fields
        const validSessionSortFields = [
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
            "leverage",
            "created_at",
            "updated_at",
        ] as const;
        const orderBy: SessionOrderBy | undefined =
            sort &&
            validSessionSortFields.includes(
                sort as (typeof validSessionSortFields)[number]
            )
                ? { [sort]: order }
                : undefined;

        return sessionsRepo.getAllSessions({
            where,
            skip: (page - 1) * limit,
            take: limit,
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
        // Validate required fields
        if (!session.instrument_id) {
            throw new BadRequestError("instrument_id is required");
        }
        if (!session.user_id) {
            throw new BadRequestError("user_id is required");
        }

        // Validate that instrument exists
        const instrument = await instrumentsRepo.getInstrumentById(
            session.instrument_id
        );
        if (!instrument) {
            this.logger.debug(
                { instrument_id: session.instrument_id },
                "Instrument not found when creating session"
            );
            throw new NotFoundError(
                `Instrument with ID ${session.instrument_id} not found`
            );
        }

        this.logger.trace(
            { instrument_id: session.instrument_id, user_id: session.user_id },
            "Creating session"
        );

        // Speed is already in Prisma format from the request
        const prismaSessionData = session as SessionCreateInput;

        const created = await sessionsRepo.createSession(prismaSessionData);
        this.logger.debug({ id: created.id }, "Session created");
        await sessionsCacheRepo.cacheSession(created.id, created);
        this.logger.trace({ id: created.id }, "Session cached");
        return created;
    }

    /**
     * Update an existing session
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
        this.validateSessionUpdateBusinessRules(session, existing, id);

        const updated = await sessionsRepo.updateSession(id, session);
        this.logger.debug({ id: updated.id }, "Session updated");
        const numericId = Number(id);
        await sessionsCacheRepo.cacheSession(numericId, updated);
        this.logger.trace({ id: updated.id }, "Session cached");
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
        const numericId = Number(id);
        await sessionsCacheRepo.invalidateCachedSession(numericId);
        this.logger.trace({ id }, "Session invalidated from cache");
    }
}

export default new SessionsService();
