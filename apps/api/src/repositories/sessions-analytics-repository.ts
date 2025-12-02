/**
 * Session Analytics Repository
 *
 * Data access layer for SessionAnalytics model operations.
 */

import type { Prisma, SessionAnalytics } from "../generated/prisma/client";
import { prisma } from "../libs/prisma";

/**
 * Get all session analytics matching optional filter conditions
 */
async function getAllSessionAnalytics(
    where?: Prisma.SessionAnalyticsWhereInput
): Promise<SessionAnalytics[]> {
    return prisma.sessionAnalytics.findMany({ where });
}

/**
 * Get a session analytics by ID
 */
async function getSessionAnalyticsById(
    id: number | string
): Promise<SessionAnalytics | null> {
    return prisma.sessionAnalytics.findUnique({
        where: { id: Number(id) },
    });
}

/**
 * Create a new session analytics
 */
async function createSessionAnalytics(
    data: Prisma.SessionAnalyticsCreateInput
): Promise<SessionAnalytics> {
    return prisma.sessionAnalytics.create({ data });
}

/**
 * Update an existing session analytics
 */
async function updateSessionAnalytics(
    id: number | string,
    data: Prisma.SessionAnalyticsUpdateInput
): Promise<SessionAnalytics> {
    return prisma.sessionAnalytics.update({
        where: { id: Number(id) },
        data,
    });
}

/**
 * Delete a session analytics by ID
 */
async function deleteSessionAnalytics(
    id: number | string
): Promise<SessionAnalytics> {
    return prisma.sessionAnalytics.delete({
        where: { id: Number(id) },
    });
}

export default {
    getAllSessionAnalytics,
    getSessionAnalyticsById,
    createSessionAnalytics,
    updateSessionAnalytics,
    deleteSessionAnalytics,
};
