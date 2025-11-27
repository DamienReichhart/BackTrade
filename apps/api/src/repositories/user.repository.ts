import type { Prisma, User } from "../generated/prisma/client";
import { prisma } from "../libs/prisma";
import type { IBaseRepository } from "./base.repository";

/**
 * Repository for User model operations
 *
 * Provides CRUD operations for managing users in the database
 */
export class UserRepository
  implements
    IBaseRepository<
      User,
      Prisma.UserCreateInput,
      Prisma.UserUpdateInput,
      Prisma.UserWhereInput
    >
{
  /**
   * Get all users
   *
   * @param where - Optional filter conditions
   * @returns Promise resolving to an array of users
   */
  async getAll(where?: Prisma.UserWhereInput): Promise<User[]> {
    return prisma.user.findMany({
      where,
    });
  }

  /**
   * Get a user by ID
   *
   * @param id - The user ID
   * @returns Promise resolving to the user or null if not found
   */
  async getById(id: number | string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id: Number(id) },
    });
  }

  /**
   * Create a new user
   *
   * @param data - The user data to create
   * @returns Promise resolving to the created user
   */
  async add(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({
      data,
    });
  }

  /**
   * Update an existing user
   *
   * @param id - The user ID to update
   * @param data - The user data to update
   * @returns Promise resolving to the updated user
   */
  async update(
    id: number | string,
    data: Prisma.UserUpdateInput,
  ): Promise<User> {
    return prisma.user.update({
      where: { id: Number(id) },
      data,
    });
  }

  /**
   * Delete a user by ID
   *
   * @param id - The user ID to delete
   * @returns Promise resolving to the deleted user
   */
  async delete(id: number | string): Promise<User> {
    return prisma.user.delete({
      where: { id: Number(id) },
    });
  }
}
