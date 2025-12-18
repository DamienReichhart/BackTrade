/**
 * User Session Repository
 *
 * Data access layer for UserSession (auth sessions) model operations.
 */

import type { Prisma } from "../generated/prisma/client";
import type {
    UserSession,
    UserSessionWhereInput,
    UserSessionCreateInput,
    UserSessionUpdateInput,
} from "@backtrade/types";
import { prisma } from "../libs/prisma";

/**
 * Get all user sessions matching optional filter conditions
 */
async function getAllUserSessions(
    where?: UserSessionWhereInput
): Promise<UserSession[]> {
    return prisma.userSession.findMany({
        where: where as Prisma.UserSessionWhereInput,
    }) as unknown as UserSession[];
}

/**
 * Get a user session by ID
 */
async function getUserSessionById(
    id: number | string
): Promise<UserSession | null> {
    return prisma.userSession.findUnique({
        where: { id: Number(id) },
    }) as unknown as UserSession | null;
}

/**
 * Create a new user session
 */
async function createUserSession(
    data: UserSessionCreateInput
): Promise<UserSession> {
    return prisma.userSession.create({
        data: data as Prisma.UserSessionCreateInput,
    }) as unknown as UserSession;
}

/**
 * Update an existing user session
 */
async function updateUserSession(
    id: number | string,
    data: UserSessionUpdateInput
): Promise<UserSession> {
    return prisma.userSession.update({
        where: { id: Number(id) },
        data: data as Prisma.UserSessionUpdateInput,
    }) as unknown as UserSession;
}

/**
 * Delete a user session by ID
 */
async function deleteUserSession(id: number | string): Promise<UserSession> {
    return prisma.userSession.delete({
        where: { id: Number(id) },
    }) as unknown as UserSession;
}

export default {
    getAllUserSessions,
    getUserSessionById,
    createUserSession,
    updateUserSession,
    deleteUserSession,
};
