import { datasetsRepo as datasetsRepository } from "@backtrade/data";
import {
    QueueName,
    type Dataset,
    type DatasetWhereInput,
    type DatasetCreateInput,
    type DatasetUpdateInput,
    type DatasetOrderBy,
    type SearchQuery,
    type DatasetFileSplitPayload,
} from "@backtrade/types";
import { datasetsCacheRepo } from "../../libs/cache";
import { logger } from "../../libs/pino";
import { storageService } from "../../libs/storage";
import queueService from "../queue/queue-service";
import NotFoundError from "../../errors/web/not-found-error";
import { ENV } from "../../config/env";

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
            await datasetsCacheRepo.getCachedDataset(numericId);
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
        await datasetsCacheRepo.cacheDataset(numericId, dataset);
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

        const where: DatasetWhereInput | undefined = q
            ? {
                  OR: [{ file_name: { contains: q, mode: "insensitive" } }],
              }
            : undefined;

        // Validate sort parameter against valid Dataset fields
        const validDatasetSortFields = [
            "id",
            "instrument_id",
            "timeframe",
            "uploaded_at",
            "records_count",
            "file_name",
            "start_time",
            "end_time",
            "created_at",
            "updated_at",
        ] as const;
        const orderBy: DatasetOrderBy | undefined =
            sort &&
            validDatasetSortFields.includes(
                sort as (typeof validDatasetSortFields)[number]
            )
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
    async createDataset(dataset: DatasetCreateInput): Promise<Dataset> {
        const created = await datasetsRepository.createDataset(dataset);
        this.logger.debug({ id: created.id }, "Dataset created");
        await datasetsCacheRepo.cacheDataset(created.id, created);
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
        dataset: DatasetUpdateInput
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
        await datasetsCacheRepo.cacheDataset(updated.id, updated);
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
        await datasetsCacheRepo.invalidateCachedDataset(numericId);
        this.logger.trace({ id }, "Dataset invalidated from cache");
    }

    /**
     * Upload a file for a dataset
     *
     * Uploads the file to MinIO and creates a queue job for processing.
     *
     * @param id - Dataset ID
     * @param file - File buffer
     * @param originalFileName - Original file name
     * @returns Updated dataset entity
     * @throws NotFoundError if dataset doesn't exist
     */
    async uploadDatasetFile(
        id: string,
        file: Buffer,
        originalFileName: string
    ): Promise<Dataset> {
        const numericId = Number(id);

        // Fetch dataset to validate it exists and get metadata
        const dataset = await datasetsRepository.getDatasetById(id);
        if (!dataset) {
            this.logger.debug(
                { id },
                "Dataset not found, throwing not found error"
            );
            throw new NotFoundError("Dataset not found");
        }

        // Build file path in MinIO: datasets/{datasetId}/raw/{filename}
        const filePath = `${numericId}/raw/${originalFileName}`;

        this.logger.info(
            { datasetId: numericId, filePath, fileSize: file.length },
            "Uploading dataset file to MinIO"
        );

        // Upload file to MinIO
        await storageService.upload(ENV.MINIO_DATASETS_BUCKET, filePath, file, {
            contentType: "text/csv",
            metadata: {
                datasetId: String(numericId),
                originalFileName,
            },
        });

        this.logger.debug(
            { datasetId: numericId, filePath },
            "File uploaded to MinIO successfully"
        );

        // Update dataset with file information
        const updatedDataset = await datasetsRepository.updateDataset(id, {
            file_name: originalFileName,
            uploaded_at: new Date().toISOString(),
        });

        // Invalidate cache and re-cache with updated data
        await datasetsCacheRepo.invalidateCachedDataset(numericId);
        await datasetsCacheRepo.cacheDataset(numericId, updatedDataset);

        // Create queue job for file splitting
        const payload: DatasetFileSplitPayload = {
            datasetId: numericId,
            filePath: `${ENV.MINIO_DATASETS_BUCKET}/${filePath}`,
            instrumentId: dataset.instrument_id,
            timeframe: dataset.timeframe,
        };

        const queueJobId = await queueService.queueMessage(
            QueueName.datasetFileSplit,
            payload
        );

        this.logger.info(
            { datasetId: numericId, queueJobId },
            "Dataset file split job queued"
        );

        return updatedDataset;
    }
}

export default new DatasetsService();
