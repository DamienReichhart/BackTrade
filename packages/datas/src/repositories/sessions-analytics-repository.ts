/**
 * Session Analytics Repository
 *
 * Data access layer for SessionAnalytics model operations.
 */

import type { Prisma } from "../generated/prisma/client";
import type {
    SessionAnalytics,
    SessionAnalyticsWhereInput,
    SessionAnalyticsCreateInput,
    SessionAnalyticsUpdateInput,
} from "@backtrade/types";
import { BaseRepository } from "./base-repository";

/**
 * Repository for SessionAnalytics model CRUD operations.
 */
class SessionAnalyticsRepository extends BaseRepository {
    /**
     * Get all session analytics matching optional filter conditions.
     *
     * @param where - Optional filter conditions
     * @returns Array of matching session analytics entities
     */
    async getAllSessionAnalytics(
        where?: SessionAnalyticsWhereInput
    ): Promise<SessionAnalytics[]> {
        return this.prisma.sessionAnalytics.findMany({
            where: where as SessionAnalyticsWhereInput as
                | Prisma.SessionAnalyticsWhereInput
                | undefined,
        }) as unknown as SessionAnalytics[];
    }

    /**
     * Get a session analytics entity by ID.
     *
     * @param id - SessionAnalytics ID as number or string
     * @returns SessionAnalytics entity or null if not found
     */
    async getSessionAnalyticsById(
        id: number | string
    ): Promise<SessionAnalytics | null> {
        return this.prisma.sessionAnalytics.findUnique({
            where: { id: this.toNumericId(id) },
        }) as unknown as SessionAnalytics | null;
    }

    /**
     * Create a new session analytics entity.
     *
     * @param data - SessionAnalytics creation data
     * @returns Created session analytics entity
     */
    async createSessionAnalytics(
        data: SessionAnalyticsCreateInput
    ): Promise<SessionAnalytics> {
        return this.prisma.sessionAnalytics.create({
            data: data as Prisma.SessionAnalyticsCreateInput,
        }) as unknown as SessionAnalytics;
    }

    /**
     * Update an existing session analytics entity.
     *
     * @param id - SessionAnalytics ID as number or string
     * @param data - SessionAnalytics update data
     * @returns Updated session analytics entity
     */
    async updateSessionAnalytics(
        id: number | string,
        data: SessionAnalyticsUpdateInput
    ): Promise<SessionAnalytics> {
        return this.prisma.sessionAnalytics.update({
            where: { id: this.toNumericId(id) },
            data: data as Prisma.SessionAnalyticsUpdateInput,
        }) as unknown as SessionAnalytics;
    }

    /**
     * Delete a session analytics entity by ID.
     *
     * @param id - SessionAnalytics ID as number or string
     * @returns Deleted session analytics entity
     */
    async deleteSessionAnalytics(
        id: number | string
    ): Promise<SessionAnalytics> {
        return this.prisma.sessionAnalytics.delete({
            where: { id: this.toNumericId(id) },
        }) as unknown as SessionAnalytics;
    }
}

const sessionsAnalyticsRepo = new SessionAnalyticsRepository();

export default sessionsAnalyticsRepo;
