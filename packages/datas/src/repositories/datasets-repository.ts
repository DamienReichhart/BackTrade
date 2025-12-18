/**
 * Dataset Repository
 *
 * Data access layer for Dataset model operations.
 */

import type { Prisma } from "../generated/prisma/client";
import type {
    Dataset,
    DatasetWhereInput,
    DatasetCreateInput,
    DatasetUpdateInput,
    DatasetOrderBy,
} from "@backtrade/types";
import { prisma } from "../libs/prisma";

export interface FindAllOptions {
    where?: DatasetWhereInput;
    skip?: number;
    take?: number;
    orderBy?: DatasetOrderBy;
}

/**
 * Get all datasets matching optional filter, pagination, and sorting
 */
async function getAllDatasets(options?: FindAllOptions): Promise<Dataset[]> {
    return prisma.dataset.findMany({
        where: options?.where as Prisma.DatasetWhereInput | undefined,
        skip: options?.skip,
        take: options?.take,
        orderBy: options?.orderBy as
            | Prisma.DatasetOrderByWithRelationInput
            | undefined,
    }) as unknown as Dataset[];
}

/**
 * Get a dataset by ID
 */
async function getDatasetById(id: number | string): Promise<Dataset | null> {
    return prisma.dataset.findUnique({
        where: { id: Number(id) },
    }) as unknown as Dataset | null;
}

/**
 * Create a new dataset
 */
async function createDataset(data: DatasetCreateInput): Promise<Dataset> {
    return prisma.dataset.create({
        data: data as Prisma.DatasetCreateInput,
    }) as unknown as Dataset;
}

/**
 * Update an existing dataset
 */
async function updateDataset(
    id: number | string,
    data: DatasetUpdateInput
): Promise<Dataset> {
    return prisma.dataset.update({
        where: { id: Number(id) },
        data: data as Prisma.DatasetUpdateInput,
    }) as unknown as Dataset;
}

/**
 * Delete a dataset by ID
 */
async function deleteDataset(id: number | string): Promise<Dataset> {
    return prisma.dataset.delete({
        where: { id: Number(id) },
    }) as unknown as Dataset;
}

export default {
    getAllDatasets,
    getDatasetById,
    createDataset,
    updateDataset,
    deleteDataset,
};
