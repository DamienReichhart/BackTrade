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
import { BasePostgresRepository } from "./base-repository";

export interface FindAllOptions {
    where?: DatasetWhereInput;
    skip?: number;
    take?: number;
    orderBy?: DatasetOrderBy;
}

/**
 * Repository for Dataset model CRUD operations with pagination and sorting.
 */
class DatasetsRepository extends BasePostgresRepository {
    /**
     * Find datasets with optional filtering, pagination, and sorting.
     *
     * @param options - Optional filter, pagination, and sorting options
     * @returns Array of matching datasets
     */
    async findDatasets(options?: FindAllOptions): Promise<Dataset[]> {
        return this.prisma.dataset.findMany({
            where: options?.where as Prisma.DatasetWhereInput | undefined,
            skip: options?.skip,
            take: options?.take,
            orderBy: options?.orderBy as
                | Prisma.DatasetOrderByWithRelationInput
                | undefined,
        }) as unknown as Dataset[];
    }

    /**
     * Get all datasets matching optional filter, pagination, and sorting.
     *
     * @deprecated Use findDatasets instead
     * @param options - Optional filter, pagination, and sorting options
     * @returns Array of matching datasets
     */
    async getAllDatasets(options?: FindAllOptions): Promise<Dataset[]> {
        return this.findDatasets(options);
    }

    /**
     * Get a dataset by ID.
     *
     * @param id - Dataset ID as number or string
     * @returns Dataset entity or null if not found
     */
    async getDatasetById(id: number | string): Promise<Dataset | null> {
        return this.prisma.dataset.findUnique({
            where: { id: this.toNumericId(id) },
        }) as unknown as Dataset | null;
    }

    /**
     * Create a new dataset.
     *
     * @param data - Dataset creation data
     * @returns Created dataset entity
     */
    async createDataset(data: DatasetCreateInput): Promise<Dataset> {
        return this.prisma.dataset.create({
            data: data as Prisma.DatasetCreateInput,
        }) as unknown as Dataset;
    }

    /**
     * Update an existing dataset.
     *
     * @param id - Dataset ID as number or string
     * @param data - Dataset update data
     * @returns Updated dataset entity
     */
    async updateDataset(
        id: number | string,
        data: DatasetUpdateInput
    ): Promise<Dataset> {
        return this.prisma.dataset.update({
            where: { id: this.toNumericId(id) },
            data: data as DatasetUpdateInput as Prisma.DatasetUpdateInput,
        }) as unknown as Dataset;
    }

    /**
     * Delete a dataset by ID.
     *
     * @param id - Dataset ID as number or string
     * @returns Deleted dataset entity
     */
    async deleteDataset(id: number | string): Promise<Dataset> {
        return this.prisma.dataset.delete({
            where: { id: this.toNumericId(id) },
        }) as unknown as Dataset;
    }
}

const datasetsRepo = new DatasetsRepository();

export default datasetsRepo;
