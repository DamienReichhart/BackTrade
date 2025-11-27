import type { Prisma, Position } from "../generated/prisma/client";
import { prisma } from "../libs/prisma";
import type { IBaseRepository } from "./base.repository";

/**
 * Repository for Position model operations
 *
 * Provides CRUD operations for managing trading positions in the database
 */
export class PositionRepository
  implements
    IBaseRepository<
      Position,
      Prisma.PositionCreateInput,
      Prisma.PositionUpdateInput,
      Prisma.PositionWhereInput
    >
{
  /**
   * Get all positions
   *
   * @param where - Optional filter conditions
   * @returns Promise resolving to an array of positions
   */
  async getAll(where?: Prisma.PositionWhereInput): Promise<Position[]> {
    return prisma.position.findMany({
      where,
    });
  }

  /**
   * Get a position by ID
   *
   * @param id - The position ID
   * @returns Promise resolving to the position or null if not found
   */
  async getById(id: number | string): Promise<Position | null> {
    return prisma.position.findUnique({
      where: { id: Number(id) },
    });
  }

  /**
   * Create a new position
   *
   * @param data - The position data to create
   * @returns Promise resolving to the created position
   */
  async add(data: Prisma.PositionCreateInput): Promise<Position> {
    return prisma.position.create({
      data,
    });
  }

  /**
   * Update an existing position
   *
   * @param id - The position ID to update
   * @param data - The position data to update
   * @returns Promise resolving to the updated position
   */
  async update(
    id: number | string,
    data: Prisma.PositionUpdateInput,
  ): Promise<Position> {
    return prisma.position.update({
      where: { id: Number(id) },
      data,
    });
  }

  /**
   * Delete a position by ID
   *
   * @param id - The position ID to delete
   * @returns Promise resolving to the deleted position
   */
  async delete(id: number | string): Promise<Position> {
    return prisma.position.delete({
      where: { id: Number(id) },
    });
  }
}
