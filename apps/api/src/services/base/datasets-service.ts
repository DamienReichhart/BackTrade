import {
    type Dataset,
    type Prisma,
    datasetsRepo as datasetsRepository,
} from "@backtrade/datas";
import datasetsCacheService from "../cache/datasets-cache-service";
import { logger } from "../../libs/logger/pino";
import NotFoundError from "../../errors/web/not-found-error";
import type { SearchQuery } from "@backtrade/types";

/**
 * Datasets Service
 *
 * Handles business logic for dataset operations including CRUD and caching.
 */
class DatasetsService {
    private readonly logger: ReturnType<typeof logger.child>;

    constructor() {
        this.logger = logger.child({
            service: "dataset-service",
        });
    }

    /**
     * Get a dataset by ID with caching
     *
     * @param id - Dataset ID
     * @returns Dataset entity
     * @throws NotFoundError if dataset doesn't exist
     */
    async getDatasetById(id: string): Promise<Dataset> {
        const numericId = Number(id);
        const cachedDataset =
            await datasetsCacheService.getCachedDataset(numericId);
        if (cachedDataset) {
            this.logger.trace({ id }, "Dataset found in cache");
            return cachedDataset;
        }
        this.logger.trace(
            { id },
            "Dataset not found in cache, fetching from database"
        );
        const dataset = await datasetsRepository.getDatasetById(id);
        if (!dataset) {
            this.logger.debug(
                { id },
                "Dataset not found, throwing not found error"
            );
            throw new NotFoundError("Dataset not found");
        }
        await datasetsCacheService.cacheDataset(numericId, dataset);
        this.logger.trace({ id }, "Dataset cached");
        return dataset;
    }

    /**
     * Get all datasets with optional search and pagination
     *
     * @param query - Optional search query with pagination and sorting
     * @returns Array of dataset entities
     */
    async getAllDatasets(query?: SearchQuery): Promise<Dataset[]> {
        const { q, page = 1, limit = 20, sort, order = "desc" } = query ?? {};

        const where: Prisma.DatasetWhereInput | undefined = q
            ? {
                  OR: [{ file_name: { contains: q, mode: "insensitive" } }],
              }
            : undefined;

        const orderBy: Prisma.DatasetOrderByWithRelationInput | undefined = sort
            ? { [sort]: order }
            : undefined;

        return datasetsRepository.getAllDatasets({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy,
        });
    }

    /**
     * Create a new dataset
     *
     * @param dataset - Dataset creation data
     * @returns Created dataset entity
     */
    async createDataset(dataset: Prisma.DatasetCreateInput): Promise<Dataset> {
        const created = await datasetsRepository.createDataset(dataset);
        this.logger.debug({ id: created.id }, "Dataset created");
        await datasetsCacheService.cacheDataset(created.id, created);
        this.logger.trace({ id: created.id }, "Dataset cached");
        return created;
    }

    /**
     * Update an existing dataset
     *
     * @param id - Dataset ID
     * @param dataset - Dataset update data
     * @returns Updated dataset entity
     * @throws NotFoundError if dataset doesn't exist
     */
    async updateDataset(
        id: string,
        dataset: Prisma.DatasetUpdateInput
    ): Promise<Dataset> {
        const existing = await datasetsRepository.getDatasetById(id);
        if (!existing) {
            this.logger.debug(
                { id },
                "Dataset not found, throwing not found error"
            );
            throw new NotFoundError("Dataset not found");
        }
        const updated = await datasetsRepository.updateDataset(id, dataset);
        this.logger.debug({ id: updated.id }, "Dataset updated");
        await datasetsCacheService.cacheDataset(updated.id, updated);
        this.logger.trace({ id: updated.id }, "Dataset cached");
        return updated;
    }

    /**
     * Delete a dataset
     *
     * @param id - Dataset ID
     * @throws NotFoundError if dataset doesn't exist
     */
    async deleteDataset(id: string): Promise<void> {
        const existing = await datasetsRepository.getDatasetById(id);
        if (!existing) {
            this.logger.debug(
                { id },
                "Dataset not found, throwing not found error"
            );
            throw new NotFoundError("Dataset not found");
        }
        await datasetsRepository.deleteDataset(id);
        this.logger.debug({ id }, "Dataset deleted");
        const numericId = Number(id);
        await datasetsCacheService.invalidateCachedDataset(numericId);
        this.logger.trace({ id }, "Dataset invalidated from cache");
    }
}

export default new DatasetsService();
