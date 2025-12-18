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
import { BasePostgresRepository } from "./base-repository";

/**
 * Repository for UserSession model CRUD operations.
 */
class UserSessionsRepository extends BasePostgresRepository {
    /**
     * Get all user sessions matching optional filter conditions.
     *
     * @param where - Optional filter conditions
     * @returns Array of matching user sessions
     */
    async getAllUserSessions(
        where?: UserSessionWhereInput
    ): Promise<UserSession[]> {
        return this.prisma.userSession.findMany({
            where: where as Prisma.UserSessionWhereInput,
        }) as unknown as UserSession[];
    }

    /**
     * Get a user session by ID.
     *
     * @param id - UserSession ID as number or string
     * @returns UserSession entity or null if not found
     */
    async getUserSessionById(id: number | string): Promise<UserSession | null> {
        return this.prisma.userSession.findUnique({
            where: { id: this.toNumericId(id) },
        }) as unknown as UserSession | null;
    }

    /**
     * Create a new user session.
     *
     * @param data - UserSession creation data
     * @returns Created user session entity
     */
    async createUserSession(
        data: UserSessionCreateInput
    ): Promise<UserSession> {
        return this.prisma.userSession.create({
            data: data as Prisma.UserSessionCreateInput,
        }) as unknown as UserSession;
    }

    /**
     * Update an existing user session.
     *
     * @param id - UserSession ID as number or string
     * @param data - UserSession update data
     * @returns Updated user session entity
     */
    async updateUserSession(
        id: number | string,
        data: UserSessionUpdateInput
    ): Promise<UserSession> {
        return this.prisma.userSession.update({
            where: { id: this.toNumericId(id) },
            data: data as Prisma.UserSessionUpdateInput,
        }) as unknown as UserSession;
    }

    /**
     * Delete a user session by ID.
     *
     * @param id - UserSession ID as number or string
     * @returns Deleted user session entity
     */
    async deleteUserSession(id: number | string): Promise<UserSession> {
        return this.prisma.userSession.delete({
            where: { id: this.toNumericId(id) },
        }) as unknown as UserSession;
    }
}

const userSessionsRepo = new UserSessionsRepository();

export default userSessionsRepo;
