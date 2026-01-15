/**
 * Session Repository
 *
 * Data access layer for trading Session model operations.
 */

import type { Prisma } from "../generated/prisma/client";
import type {
    Session,
    SessionWithInstrument,
    SessionWhereInput,
    SessionCreateInput,
    SessionUpdateInput,
    SessionOrderBy,
} from "@backtrade/types";
import { BasePostgresRepository } from "./base-repository";

export interface FindAllOptions {
    where?: SessionWhereInput;
    skip?: number;
    take?: number;
    orderBy?: SessionOrderBy;
}

/**
 * Repository for Session model CRUD operations with pagination and sorting.
 */
class SessionsRepository extends BasePostgresRepository {
    /**
     * Get all sessions matching optional filter, pagination, and sorting.
     *
     * @param options - Optional filter, pagination, and sorting options
     * @returns Array of matching sessions
     */
    async getAllSessions(options?: FindAllOptions): Promise<Session[]> {
        return this.prisma.session.findMany({
            where: options?.where as Prisma.SessionWhereInput | undefined,
            skip: options?.skip,
            take: options?.take,
            orderBy: options?.orderBy as
                | Prisma.SessionOrderByWithRelationInput
                | undefined,
        }) as unknown as Session[];
    }

    /**
     * Get a session by ID.
     *
     * @param id - Session ID as number or string
     * @returns Session entity or null if not found
     */
    async getSessionById(id: number | string): Promise<Session | null> {
        return this.prisma.session.findUnique({
            where: { id: this.toNumericId(id) },
        }) as unknown as Session | null;
    }

    /**
     * Get a session by ID with its instrument relation.
     *
     * @param id - Session ID as number or string
     * @returns Session with instrument or null if not found
     */
    async getSessionWithInstrument(
        id: number | string
    ): Promise<SessionWithInstrument | null> {
        return this.prisma.session.findUnique({
            where: { id: this.toNumericId(id) },
            include: { instrument: true },
        }) as unknown as SessionWithInstrument | null;
    }

    /**
     * Create a new session.
     *
     * @param data - Session creation data
     * @returns Created session entity
     */
    async createSession(data: SessionCreateInput): Promise<Session> {
        return this.prisma.session.create({
            data: data as Prisma.SessionCreateInput,
        }) as unknown as Session;
    }

    /**
     * Update an existing session.
     *
     * @param id - Session ID as number or string
     * @param data - Session update data
     * @returns Updated session entity
     */
    async updateSession(
        id: number | string,
        data: SessionUpdateInput
    ): Promise<Session> {
        return this.prisma.session.update({
            where: { id: this.toNumericId(id) },
            data: data as Prisma.SessionUpdateInput,
        }) as unknown as Session;
    }

    /**
     * Delete a session by ID.
     *
     * @param id - Session ID as number or string
     * @returns Deleted session entity
     */
    async deleteSession(id: number | string): Promise<Session> {
        return this.prisma.session.delete({
            where: { id: this.toNumericId(id) },
        }) as unknown as Session;
    }

    /**
     * Count active sessions for a user.
     *
     * Active sessions are those with session_status not equal to ARCHIVED
     * (i.e., RUNNING or PAUSED).
     *
     * @param userId - User ID to count sessions for
     * @returns Number of active sessions
     */
    async countActiveSessionsByUserId(userId: number): Promise<number> {
        return this.prisma.session.count({
            where: {
                user_id: userId,
                session_status: {
                    not: "ARCHIVED",
                },
            },
        });
    }
}

const sessionsRepo = new SessionsRepository();

export default sessionsRepo;
