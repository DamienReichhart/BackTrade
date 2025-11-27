import type { Prisma, Candle } from "../generated/prisma/client";
import { prisma } from "../libs/prisma";
import type { IBaseRepository } from "./base.repository";

/**
 * Repository for Candle model operations
 *
 * Provides CRUD operations for managing market data candles in the database
 */
export class CandleRepository
  implements
    IBaseRepository<
      Candle,
      Prisma.CandleCreateInput,
      Prisma.CandleUpdateInput,
      Prisma.CandleWhereInput
    >
{
  /**
   * Get all candles
   *
   * @param where - Optional filter conditions
   * @returns Promise resolving to an array of candles
   */
  async getAll(where?: Prisma.CandleWhereInput): Promise<Candle[]> {
    return prisma.candle.findMany({
      where,
    });
  }

  /**
   * Get a candle by ID
   *
   * @param id - The candle ID
   * @returns Promise resolving to the candle or null if not found
   */
  async getById(id: number | string): Promise<Candle | null> {
    return prisma.candle.findUnique({
      where: { id: Number(id) },
    });
  }

  /**
   * Create a new candle
   *
   * @param data - The candle data to create
   * @returns Promise resolving to the created candle
   */
  async add(data: Prisma.CandleCreateInput): Promise<Candle> {
    return prisma.candle.create({
      data,
    });
  }

  /**
   * Update an existing candle
   *
   * @param id - The candle ID to update
   * @param data - The candle data to update
   * @returns Promise resolving to the updated candle
   */
  async update(
    id: number | string,
    data: Prisma.CandleUpdateInput,
  ): Promise<Candle> {
    return prisma.candle.update({
      where: { id: Number(id) },
      data,
    });
  }

  /**
   * Delete a candle by ID
   *
   * @param id - The candle ID to delete
   * @returns Promise resolving to the deleted candle
   */
  async delete(id: number | string): Promise<Candle> {
    return prisma.candle.delete({
      where: { id: Number(id) },
    });
  }
}
