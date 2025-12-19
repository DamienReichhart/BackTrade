import { sessionsRepo } from "@backtrade/data";
import type {
    Session,
    SessionWhereInput,
    SessionCreateInput,
    SessionUpdateInput,
    SessionOrderBy,
    SearchQuery,
} from "@backtrade/types";
import { sessionsCacheRepo } from "../../libs/cache";
import { logger } from "../../libs/pino";
import NotFoundError from "../../errors/web/not-found-error";

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
     * Get a session by ID with caching
     *
     * @param id - Session ID
     * @returns Session entity
     * @throws NotFoundError if session doesn't exist
     */
    async getSessionById(id: string): Promise<Session> {
        const numericId = Number(id);
        const cachedSession =
            await sessionsCacheRepo.getCachedSession(numericId);
        if (cachedSession) {
            this.logger.trace({ id }, "Session found in cache");
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
     * @param session - Session creation data
     * @returns Created session entity
     */
    async createSession(session: SessionCreateInput): Promise<Session> {
        const created = await sessionsRepo.createSession(session);
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
     * @returns Updated session entity
     * @throws NotFoundError if session doesn't exist
     */
    async updateSession(
        id: string,
        session: SessionUpdateInput
    ): Promise<Session> {
        const existing = await sessionsRepo.getSessionById(id);
        if (!existing) {
            this.logger.debug(
                { id },
                "Session not found, throwing not found error"
            );
            throw new NotFoundError("Session not found");
        }
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
     * @throws NotFoundError if session doesn't exist
     */
    async deleteSession(id: string): Promise<void> {
        const existing = await sessionsRepo.getSessionById(id);
        if (!existing) {
            this.logger.debug(
                { id },
                "Session not found, throwing not found error"
            );
            throw new NotFoundError("Session not found");
        }
        await sessionsRepo.deleteSession(id);
        this.logger.debug({ id }, "Session deleted");
        const numericId = Number(id);
        await sessionsCacheRepo.invalidateCachedSession(numericId);
        this.logger.trace({ id }, "Session invalidated from cache");
    }
}

export default new SessionsService();
