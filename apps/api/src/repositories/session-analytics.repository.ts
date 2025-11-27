import type { Prisma, SessionAnalytics } from "../generated/prisma/client";
import { prisma } from "../libs/prisma";
import type { IBaseRepository } from "./base.repository";

/**
 * Repository for SessionAnalytics model operations
 *
 * Provides CRUD operations for managing session analytics in the database
 */
export class SessionAnalyticsRepository
  implements
    IBaseRepository<
      SessionAnalytics,
      Prisma.SessionAnalyticsCreateInput,
      Prisma.SessionAnalyticsUpdateInput,
      Prisma.SessionAnalyticsWhereInput
    >
{
  /**
   * Get all session analytics
   *
   * @param where - Optional filter conditions
   * @returns Promise resolving to an array of session analytics
   */
  async getAll(
    where?: Prisma.SessionAnalyticsWhereInput,
  ): Promise<SessionAnalytics[]> {
    return prisma.sessionAnalytics.findMany({
      where,
    });
  }

  /**
   * Get a session analytics record by ID
   *
   * @param id - The session analytics ID
   * @returns Promise resolving to the session analytics or null if not found
   */
  async getById(id: number | string): Promise<SessionAnalytics | null> {
    return prisma.sessionAnalytics.findUnique({
      where: { id: Number(id) },
    });
  }

  /**
   * Create a new session analytics record
   *
   * @param data - The session analytics data to create
   * @returns Promise resolving to the created session analytics
   */
  async add(
    data: Prisma.SessionAnalyticsCreateInput,
  ): Promise<SessionAnalytics> {
    return prisma.sessionAnalytics.create({
      data,
    });
  }

  /**
   * Update an existing session analytics record
   *
   * @param id - The session analytics ID to update
   * @param data - The session analytics data to update
   * @returns Promise resolving to the updated session analytics
   */
  async update(
    id: number | string,
    data: Prisma.SessionAnalyticsUpdateInput,
  ): Promise<SessionAnalytics> {
    return prisma.sessionAnalytics.update({
      where: { id: Number(id) },
      data,
    });
  }

  /**
   * Delete a session analytics record by ID
   *
   * @param id - The session analytics ID to delete
   * @returns Promise resolving to the deleted session analytics
   */
  async delete(id: number | string): Promise<SessionAnalytics> {
    return prisma.sessionAnalytics.delete({
      where: { id: Number(id) },
    });
  }
}
