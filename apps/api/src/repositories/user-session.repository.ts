/**
 * User Session Repository
 *
 * Data access layer for UserSession (auth sessions) model operations.
 */

import type { Prisma, UserSession } from "../generated/prisma/client";
import { prisma } from "../libs/prisma";

/**
 * Get all user sessions matching optional filter conditions
 */
export async function getAllUserSessions(
    where?: Prisma.UserSessionWhereInput,
): Promise<UserSession[]> {
    return prisma.userSession.findMany({ where });
}

/**
 * Get a user session by ID
 */
export async function getUserSessionById(id: number | string): Promise<UserSession | null> {
    return prisma.userSession.findUnique({
        where: { id: Number(id) },
    });
}

/**
 * Create a new user session
 */
export async function createUserSession(data: Prisma.UserSessionCreateInput): Promise<UserSession> {
    return prisma.userSession.create({ data });
}

/**
 * Update an existing user session
 */
export async function updateUserSession(
    id: number | string,
    data: Prisma.UserSessionUpdateInput,
): Promise<UserSession> {
    return prisma.userSession.update({
        where: { id: Number(id) },
        data,
    });
}

/**
 * Delete a user session by ID
 */
export async function deleteUserSession(id: number | string): Promise<UserSession> {
    return prisma.userSession.delete({
        where: { id: Number(id) },
    });
}
