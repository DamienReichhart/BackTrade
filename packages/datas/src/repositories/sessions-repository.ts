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
import { prisma } from "../libs/prisma";

/**
 * Get all sessions matching optional filter conditions
 */
async function getAllSessions(where?: SessionWhereInput): Promise<Session[]> {
    return prisma.session.findMany({
        where: where as Prisma.SessionWhereInput,
    }) as unknown as Session[];
}

/**
 * Get a session by ID
 */
async function getSessionById(id: number | string): Promise<Session | null> {
    return prisma.session.findUnique({
        where: { id: Number(id) },
    }) as unknown as Session | null;
}

/**
 * Create a new session
 */
async function createSession(data: SessionCreateInput): Promise<Session> {
    return prisma.session.create({
        data: data as Prisma.SessionCreateInput,
    }) as unknown as Session;
}

/**
 * Update an existing session
 */
async function updateSession(
    id: number | string,
    data: SessionUpdateInput
): Promise<Session> {
    return prisma.session.update({
        where: { id: Number(id) },
        data: data as Prisma.SessionUpdateInput,
    }) as unknown as Session;
}

/**
 * Delete a session by ID
 */
async function deleteSession(id: number | string): Promise<Session> {
    return prisma.session.delete({
        where: { id: Number(id) },
    }) as unknown as Session;
}

export default {
    getAllSessions,
    getSessionById,
    createSession,
    updateSession,
    deleteSession,
};
