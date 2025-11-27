/**
 * Dataset Repository
 *
 * Data access layer for Dataset model operations.
 */

import type { Dataset, Prisma } from "../generated/prisma/client";
import { prisma } from "../libs/prisma";

/**
 * Get all datasets matching optional filter conditions
 */
export async function getAllDatasets(
  where?: Prisma.DatasetWhereInput,
): Promise<Dataset[]> {
  return prisma.dataset.findMany({ where });
}

/**
 * Get a dataset by ID
 */
export async function getDatasetById(
  id: number | string,
): Promise<Dataset | null> {
  return prisma.dataset.findUnique({
    where: { id: Number(id) },
  });
}

/**
 * Create a new dataset
 */
export async function createDataset(
  data: Prisma.DatasetCreateInput,
): Promise<Dataset> {
  return prisma.dataset.create({ data });
}

/**
 * Update an existing dataset
 */
export async function updateDataset(
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
 */
export async function deleteDataset(id: number | string): Promise<Dataset> {
  return prisma.dataset.delete({
    where: { id: Number(id) },
  });
}
