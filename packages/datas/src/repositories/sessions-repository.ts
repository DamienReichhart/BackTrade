/**
 * Session Repository
 *
 * Data access layer for trading Session model operations.
 */

import type { Prisma } from "../generated/prisma/client";
import type {
    Session,
    SessionWhereInput,
    SessionCreateInput,
    SessionUpdateInput,
} from "@backtrade/types";
import { BaseRepository } from "./base-repository";

/**
 * Repository for Session model CRUD operations.
 */
class SessionsRepository extends BaseRepository {
    /**
     * Get all sessions matching optional filter conditions.
     *
     * @param where - Optional filter conditions
     * @returns Array of matching sessions
     */
    async getAllSessions(where?: SessionWhereInput): Promise<Session[]> {
        return this.prisma.session.findMany({
            where: where as Prisma.SessionWhereInput,
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
}

const sessionsRepo = new SessionsRepository();

export default sessionsRepo;
