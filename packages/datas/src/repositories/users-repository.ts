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
import { BaseRepository } from "./base-repository";

/**
 * Repository for User model CRUD operations.
 */
class UsersRepository extends BaseRepository {
    /**
     * Get all users matching optional filter conditions.
     *
     * @param where - Optional filter conditions
     * @returns Array of matching users
     */
    async getAllUsers(where?: UserWhereInput): Promise<User[]> {
        return this.prisma.user.findMany({
            where: where as Prisma.UserWhereInput,
        }) as unknown as User[];
    }

    /**
     * Get a user by ID.
     *
     * @param id - User ID as number or string
     * @returns User entity or null if not found
     */
    async getUserById(id: number | string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { id: this.toNumericId(id) },
        }) as unknown as User | null;
    }

    /**
     * Get a user by email.
     *
     * @param email - User email
     * @returns User entity or null if not found
     */
    async getUserByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { email },
        }) as unknown as User | null;
    }

    /**
     * Create a new user.
     *
     * @param data - User creation data
     * @returns Created user entity
     */
    async createUser(data: UserCreateInput): Promise<User> {
        return this.prisma.user.create({
            data: data as Prisma.UserCreateInput,
        }) as unknown as User;
    }

    /**
     * Update an existing user.
     *
     * @param id - User ID as number or string
     * @param data - User update data
     * @returns Updated user entity
     */
    async updateUser(
        id: number | string,
        data: UserUpdateInput
    ): Promise<User> {
        return this.prisma.user.update({
            where: { id: this.toNumericId(id) },
            data: data as Prisma.UserUpdateInput,
        }) as unknown as User;
    }

    /**
     * Delete a user by ID.
     *
     * @param id - User ID as number or string
     * @returns Deleted user entity
     */
    async deleteUser(id: number | string): Promise<User> {
        return this.prisma.user.delete({
            where: { id: this.toNumericId(id) },
        }) as unknown as User;
    }
}

const usersRepo = new UsersRepository();

export default usersRepo;
