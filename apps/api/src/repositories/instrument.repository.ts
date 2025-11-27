import type { Prisma, Instrument } from "../generated/prisma/client";
import { prisma } from "../libs/prisma";
import type { IBaseRepository } from "./base.repository";

/**
 * Repository for Instrument model operations
 *
 * Provides CRUD operations for managing trading instruments in the database
 */
export class InstrumentRepository
  implements
    IBaseRepository<
      Instrument,
      Prisma.InstrumentCreateInput,
      Prisma.InstrumentUpdateInput,
      Prisma.InstrumentWhereInput
    >
{
  /**
   * Get all instruments
   *
   * @param where - Optional filter conditions
   * @returns Promise resolving to an array of instruments
   */
  async getAll(where?: Prisma.InstrumentWhereInput): Promise<Instrument[]> {
    return prisma.instrument.findMany({
      where,
    });
  }

  /**
   * Get an instrument by ID
   *
   * @param id - The instrument ID
   * @returns Promise resolving to the instrument or null if not found
   */
  async getById(id: number | string): Promise<Instrument | null> {
    return prisma.instrument.findUnique({
      where: { id: Number(id) },
    });
  }

  /**
   * Create a new instrument
   *
   * @param data - The instrument data to create
   * @returns Promise resolving to the created instrument
   */
  async add(data: Prisma.InstrumentCreateInput): Promise<Instrument> {
    return prisma.instrument.create({
      data,
    });
  }

  /**
   * Update an existing instrument
   *
   * @param id - The instrument ID to update
   * @param data - The instrument data to update
   * @returns Promise resolving to the updated instrument
   */
  async update(
    id: number | string,
    data: Prisma.InstrumentUpdateInput,
  ): Promise<Instrument> {
    return prisma.instrument.update({
      where: { id: Number(id) },
      data,
    });
  }

  /**
   * Delete an instrument by ID
   *
   * @param id - The instrument ID to delete
   * @returns Promise resolving to the deleted instrument
   */
  async delete(id: number | string): Promise<Instrument> {
    return prisma.instrument.delete({
      where: { id: Number(id) },
    });
  }
}
