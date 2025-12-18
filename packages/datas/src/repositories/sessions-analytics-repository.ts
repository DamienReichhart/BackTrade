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
import { prisma } from "../libs/prisma";

/**
 * Get all session analytics matching optional filter conditions
 */
async function getAllSessionAnalytics(
    where?: SessionAnalyticsWhereInput
): Promise<SessionAnalytics[]> {
    return prisma.sessionAnalytics.findMany({
        where: where as Prisma.SessionAnalyticsWhereInput,
    }) as unknown as SessionAnalytics[];
}

/**
 * Get a session analytics by ID
 */
async function getSessionAnalyticsById(
    id: number | string
): Promise<SessionAnalytics | null> {
    return prisma.sessionAnalytics.findUnique({
        where: { id: Number(id) },
    }) as unknown as SessionAnalytics | null;
}

/**
 * Create a new session analytics
 */
async function createSessionAnalytics(
    data: SessionAnalyticsCreateInput
): Promise<SessionAnalytics> {
    return prisma.sessionAnalytics.create({
        data: data as Prisma.SessionAnalyticsCreateInput,
    }) as unknown as SessionAnalytics;
}

/**
 * Update an existing session analytics
 */
async function updateSessionAnalytics(
    id: number | string,
    data: SessionAnalyticsUpdateInput
): Promise<SessionAnalytics> {
    return prisma.sessionAnalytics.update({
        where: { id: Number(id) },
        data: data as Prisma.SessionAnalyticsUpdateInput,
    }) as unknown as SessionAnalytics;
}

/**
 * Delete a session analytics by ID
 */
async function deleteSessionAnalytics(
    id: number | string
): Promise<SessionAnalytics> {
    return prisma.sessionAnalytics.delete({
        where: { id: Number(id) },
    }) as unknown as SessionAnalytics;
}

export default {
    getAllSessionAnalytics,
    getSessionAnalyticsById,
    createSessionAnalytics,
    updateSessionAnalytics,
    deleteSessionAnalytics,
};
