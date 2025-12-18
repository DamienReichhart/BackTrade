/**
 * User Repository
 *
 * Data access layer for User model operations.
 */

import type { Prisma } from "../generated/prisma/client";
import type {
    User,
    UserWhereInput,
    UserCreateInput,
    UserUpdateInput,
} from "@backtrade/types";
import { prisma } from "../libs/prisma";

/**
 * Get all users matching optional filter conditions
 */
async function getAllUsers(where?: UserWhereInput): Promise<User[]> {
    return prisma.user.findMany({
        where: where as Prisma.UserWhereInput,
    }) as unknown as User[];
}

/**
 * Get a user by ID
 */
async function getUserById(id: number | string): Promise<User | null> {
    return prisma.user.findUnique({
        where: { id: Number(id) },
    }) as unknown as User | null;
}

async function getUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
        where: { email },
    }) as unknown as User | null;
}

/**
 * Create a new user
 */
async function createUser(data: UserCreateInput): Promise<User> {
    return prisma.user.create({
        data: data as Prisma.UserCreateInput,
    }) as unknown as User;
}

/**
 * Update an existing user
 */
async function updateUser(
    id: number | string,
    data: UserUpdateInput
): Promise<User> {
    return prisma.user.update({
        where: { id: Number(id) },
        data: data as Prisma.UserUpdateInput,
    }) as unknown as User;
}

/**
 * Delete a user by ID
 */
async function deleteUser(id: number | string): Promise<User> {
    return prisma.user.delete({
        where: { id: Number(id) },
    }) as unknown as User;
}

export default {
    getAllUsers,
    getUserById,
    getUserByEmail,
    createUser,
    updateUser,
    deleteUser,
};
