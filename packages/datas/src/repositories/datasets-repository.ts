/**
 * Dataset Repository
 *
 * Data access layer for Dataset model operations.
 */

import type { Dataset, Prisma } from "../generated/prisma/client";
import { prisma } from "../libs/prisma";

export interface FindAllOptions {
    where?: Prisma.DatasetWhereInput;
    skip?: number;
    take?: number;
    orderBy?: Prisma.DatasetOrderByWithRelationInput;
}

/**
 * Get all datasets matching optional filter, pagination, and sorting
 */
async function getAllDatasets(options?: FindAllOptions): Promise<Dataset[]> {
    return prisma.dataset.findMany({
        where: options?.where,
        skip: options?.skip,
        take: options?.take,
        orderBy: options?.orderBy,
    });
}

/**
 * Get a dataset by ID
 */
async function getDatasetById(id: number | string): Promise<Dataset | null> {
    return prisma.dataset.findUnique({
        where: { id: Number(id) },
    });
}

/**
 * Create a new dataset
 */
async function createDataset(
    data: Prisma.DatasetCreateInput
): Promise<Dataset> {
    return prisma.dataset.create({ data });
}

/**
 * Update an existing dataset
 */
async function updateDataset(
    id: number | string,
    data: Prisma.DatasetUpdateInput
): Promise<Dataset> {
    return prisma.dataset.update({
        where: { id: Number(id) },
        data,
    });
}

/**
 * Delete a dataset by ID
 */
async function deleteDataset(id: number | string): Promise<Dataset> {
    return prisma.dataset.delete({
        where: { id: Number(id) },
    });
}

export default {
    getAllDatasets,
    getDatasetById,
    createDataset,
    updateDataset,
    deleteDataset,
};
