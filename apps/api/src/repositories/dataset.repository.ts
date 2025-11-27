import type { Prisma, Dataset } from "../generated/prisma/client";
import { prisma } from "../libs/prisma";
import type { IBaseRepository } from "./base.repository";

/**
 * Repository for Dataset model operations
 *
 * Provides CRUD operations for managing datasets in the database
 */
export class DatasetRepository
  implements
    IBaseRepository<
      Dataset,
      Prisma.DatasetCreateInput,
      Prisma.DatasetUpdateInput,
      Prisma.DatasetWhereInput
    >
{
  /**
   * Get all datasets
   *
   * @param where - Optional filter conditions
   * @returns Promise resolving to an array of datasets
   */
  async getAll(where?: Prisma.DatasetWhereInput): Promise<Dataset[]> {
    return prisma.dataset.findMany({
      where,
    });
  }

  /**
   * Get a dataset by ID
   *
   * @param id - The dataset ID
   * @returns Promise resolving to the dataset or null if not found
   */
  async getById(id: number | string): Promise<Dataset | null> {
    return prisma.dataset.findUnique({
      where: { id: Number(id) },
    });
  }

  /**
   * Create a new dataset
   *
   * @param data - The dataset data to create
   * @returns Promise resolving to the created dataset
   */
  async add(data: Prisma.DatasetCreateInput): Promise<Dataset> {
    return prisma.dataset.create({
      data,
    });
  }

  /**
   * Update an existing dataset
   *
   * @param id - The dataset ID to update
   * @param data - The dataset data to update
   * @returns Promise resolving to the updated dataset
   */
  async update(
    id: number | string,
    data: Prisma.DatasetUpdateInput,
  ): Promise<Dataset> {
    return prisma.dataset.update({
      where: { id: Number(id) },
      data,
    });
  }

  /**
   * Delete a dataset by ID
   *
   * @param id - The dataset ID to delete
   * @returns Promise resolving to the deleted dataset
   */
  async delete(id: number | string): Promise<Dataset> {
    return prisma.dataset.delete({
      where: { id: Number(id) },
    });
  }
}
