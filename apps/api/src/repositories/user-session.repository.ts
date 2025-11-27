import type { Prisma, UserSession } from "../generated/prisma/client";
import { prisma } from "../libs/prisma";
import type { IBaseRepository } from "./base.repository";

/**
 * Repository for UserSession model operations
 *
 * Provides CRUD operations for managing user sessions in the database
 */
export class UserSessionRepository
  implements
    IBaseRepository<
      UserSession,
      Prisma.UserSessionCreateInput,
      Prisma.UserSessionUpdateInput,
      Prisma.UserSessionWhereInput
    >
{
  /**
   * Get all user sessions
   *
   * @param where - Optional filter conditions
   * @returns Promise resolving to an array of user sessions
   */
  async getAll(where?: Prisma.UserSessionWhereInput): Promise<UserSession[]> {
    return prisma.userSession.findMany({
      where,
    });
  }

  /**
   * Get a user session by ID
   *
   * @param id - The user session ID
   * @returns Promise resolving to the user session or null if not found
   */
  async getById(id: number | string): Promise<UserSession | null> {
    return prisma.userSession.findUnique({
      where: { id: Number(id) },
    });
  }

  /**
   * Create a new user session
   *
   * @param data - The user session data to create
   * @returns Promise resolving to the created user session
   */
  async add(data: Prisma.UserSessionCreateInput): Promise<UserSession> {
    return prisma.userSession.create({
      data,
    });
  }

  /**
   * Update an existing user session
   *
   * @param id - The user session ID to update
   * @param data - The user session data to update
   * @returns Promise resolving to the updated user session
   */
  async update(
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
   *
   * @param id - The user session ID to delete
   * @returns Promise resolving to the deleted user session
   */
  async delete(id: number | string): Promise<UserSession> {
    return prisma.userSession.delete({
      where: { id: Number(id) },
    });
  }
}
