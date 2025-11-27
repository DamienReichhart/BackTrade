import type { Prisma, Session } from "../generated/prisma/client";
import { prisma } from "../libs/prisma";
import type { IBaseRepository } from "./base.repository";

/**
 * Repository for Session model operations
 *
 * Provides CRUD operations for managing trading sessions in the database
 */
export class SessionRepository
  implements
    IBaseRepository<
      Session,
      Prisma.SessionCreateInput,
      Prisma.SessionUpdateInput,
      Prisma.SessionWhereInput
    >
{
  /**
   * Get all sessions
   *
   * @param where - Optional filter conditions
   * @returns Promise resolving to an array of sessions
   */
  async getAll(where?: Prisma.SessionWhereInput): Promise<Session[]> {
    return prisma.session.findMany({
      where,
    });
  }

  /**
   * Get a session by ID
   *
   * @param id - The session ID
   * @returns Promise resolving to the session or null if not found
   */
  async getById(id: number | string): Promise<Session | null> {
    return prisma.session.findUnique({
      where: { id: Number(id) },
    });
  }

  /**
   * Create a new session
   *
   * @param data - The session data to create
   * @returns Promise resolving to the created session
   */
  async add(data: Prisma.SessionCreateInput): Promise<Session> {
    return prisma.session.create({
      data,
    });
  }

  /**
   * Update an existing session
   *
   * @param id - The session ID to update
   * @param data - The session data to update
   * @returns Promise resolving to the updated session
   */
  async update(
    id: number | string,
    data: Prisma.SessionUpdateInput,
  ): Promise<Session> {
    return prisma.session.update({
      where: { id: Number(id) },
      data,
    });
  }

  /**
   * Delete a session by ID
   *
   * @param id - The session ID to delete
   * @returns Promise resolving to the deleted session
   */
  async delete(id: number | string): Promise<Session> {
    return prisma.session.delete({
      where: { id: Number(id) },
    });
  }
}
