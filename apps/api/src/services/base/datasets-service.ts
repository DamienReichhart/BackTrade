import { datasetsRepo, instrumentsRepo } from "@backtrade/data";
import {
    QueueName,
    TIMEFRAME_VALUES,
    type Dataset,
    type DatasetWhereInput,
    type DatasetCreateInput,
    type DatasetUpdateInput,
    type DatasetOrderBy,
    type SearchQuery,
    type DatasetFileSplitPayload,
    type User,
    type Timeframe,
} from "@backtrade/types";
import { datasetsCacheRepo } from "../../libs/cache";
import { storageService } from "../../libs/storage";
import queueService from "../queue/queue-service";
import NotFoundError from "../../errors/web/not-found-error";
import BadRequestError from "../../errors/web/bad-request-error";
import ForbiddenError from "../../errors/web/forbidden-error";
import { ENV } from "../../config/env";
import { BaseService } from "./base-service";
import { buildOrderBy, buildPagination } from "../../utils";
import { PAGINATION_CONSTANTS } from "../../config/trading-constants";

/**
 * Valid timeframes for datasets
 * Uses enum values from @backtrade/types for consistency
 */
const VALID_TIMEFRAMES = TIMEFRAME_VALUES;

/**
 * Valid sortable fields for datasets
 */
const VALID_SORT_FIELDS = [
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

type DatasetSortField = (typeof VALID_SORT_FIELDS)[number];

/**
 * Interface for stored chunk data
 */
interface ChunkData {
    buffer: Buffer;
    chunkIndex: number;
    receivedAt: number;
}

/**
 * Interface for chunk upload result
 */
interface ChunkUploadResult {
    complete: boolean;
    receivedChunks: number;
}

/**
 * Datasets Service
 *
 * Handles business logic for dataset operations including CRUD, validation, and caching.
 * Datasets represent historical market data files for backtesting.
 *
 * Authorization model:
 * - Read operations (getById, getAll): Public (any authenticated user)
 * - Write operations (create, update, delete, upload): Admin only
 */
class DatasetsService extends BaseService {
    /**
     * In-memory storage for file chunks during chunked uploads
     * Key: `${datasetId}-${originalFileName}`
     * Value: Map of chunkIndex -> ChunkData
     *
     * Note: This is a simple in-memory solution. For production with multiple instances,
     * consider using Redis or another shared storage solution.
     */
    private readonly chunkStorage = new Map<string, Map<number, ChunkData>>();

    /**
     * Cleanup interval for stale chunks (5 minutes)
     */
    private readonly CHUNK_CLEANUP_INTERVAL = 5 * 60 * 1000;

    constructor() {
        super("datasets-service");

        // Start cleanup interval for stale chunks
        setInterval(() => {
            this.cleanupStaleChunks();
        }, this.CHUNK_CLEANUP_INTERVAL);
    }

    // ============================================================================
    // VALIDATION METHODS
    // ============================================================================

    /**
     * Validate that instrument_id is provided
     *
     * @param instrumentId - Instrument ID to validate
     * @throws BadRequestError if instrument_id is missing
     */
    private validateInstrumentId(
        instrumentId: number | undefined | null
    ): void {
        if (!instrumentId) {
            throw new BadRequestError("instrument_id is required");
        }
    }

    /**
     * Validate that timeframe is provided and valid
     *
     * @param timeframe - Timeframe to validate
     * @throws BadRequestError if timeframe is missing or invalid
     */
    private validateTimeframe(timeframe: string | undefined | null): void {
        if (!timeframe) {
            throw new BadRequestError("timeframe is required");
        }
        if (!VALID_TIMEFRAMES.includes(timeframe as Timeframe)) {
            throw new BadRequestError(
                `Invalid timeframe. Must be one of: ${VALID_TIMEFRAMES.join(", ")}`
            );
        }
    }

    /**
     * Validate that the referenced instrument exists
     *
     * @param instrumentId - Instrument ID to validate
     * @throws NotFoundError if instrument doesn't exist
     */
    private async validateInstrumentExists(
        instrumentId: number
    ): Promise<void> {
        const instrument =
            await instrumentsRepo.getInstrumentById(instrumentId);
        if (!instrument) {
            this.logger.debug(
                { instrument_id: instrumentId },
                "Instrument not found when creating dataset"
            );
            throw new NotFoundError(
                `Instrument with ID ${instrumentId} not found`
            );
        }
    }

    /**
     * Validate records_count is non-negative if provided
     *
     * @param recordsCount - Records count to validate
     * @throws BadRequestError if records_count is negative
     */
    private validateRecordsCount(
        recordsCount: number | undefined | null
    ): void {
        if (
            recordsCount !== undefined &&
            recordsCount !== null &&
            recordsCount < 0
        ) {
            throw new BadRequestError("records_count must be non-negative");
        }
    }

    /**
     * Validate that start_time is before end_time if both provided
     *
     * @param startTime - Start time to validate
     * @param endTime - End time to validate
     * @throws BadRequestError if start_time >= end_time
     */
    private validateTimeRange(
        startTime: string | undefined | null,
        endTime: string | undefined | null
    ): void {
        if (startTime && endTime) {
            const start = new Date(startTime);
            const end = new Date(endTime);
            if (start >= end) {
                throw new BadRequestError("start_time must be before end_time");
            }
        }
    }

    /**
     * Validate all business rules for dataset creation
     *
     * @param dataset - Dataset creation data
     * @throws BadRequestError if validation fails
     * @throws NotFoundError if instrument doesn't exist
     */
    private async validateDatasetCreation(
        dataset: DatasetCreateInput
    ): Promise<void> {
        this.validateInstrumentId(dataset.instrument_id);
        this.validateTimeframe(dataset.timeframe);
        this.validateRecordsCount(dataset.records_count);
        this.validateTimeRange(dataset.start_time, dataset.end_time);
        await this.validateInstrumentExists(dataset.instrument_id as number);
    }

    /**
     * Validate all business rules for dataset update
     *
     * @param dataset - Dataset update data
     * @param existing - Existing dataset entity (for time range validation)
     * @throws BadRequestError if validation fails
     */
    private validateDatasetUpdate(
        dataset: DatasetUpdateInput,
        existing: Dataset
    ): void {
        // Validate timeframe if provided
        if (dataset.timeframe !== undefined) {
            this.validateTimeframe(dataset.timeframe);
        }

        // Validate records_count if provided
        this.validateRecordsCount(dataset.records_count);

        // Validate time range (use new values if provided, otherwise existing)
        const startTime = dataset.start_time ?? existing.start_time;
        const endTime = dataset.end_time ?? existing.end_time;
        this.validateTimeRange(startTime, endTime);
    }

    // ============================================================================
    // AUTHORIZATION METHODS
    // ============================================================================

    /**
     * Ensure user has admin access for write operations
     *
     * Datasets are public for reading but require admin access for modifications.
     *
     * @param user - User entity making the request
     * @param operation - Operation being performed (for logging)
     * @throws ForbiddenError if user is not admin
     */
    private ensureAdminAccess(user: User, operation: string): void {
        if (user.role !== "ADMIN") {
            this.logger.debug(
                {
                    userId: user.id,
                    userRole: user.role,
                    operation,
                },
                "Non-admin user attempted dataset write operation"
            );
            throw new ForbiddenError(
                "Only administrators can perform this operation on datasets"
            );
        }
    }

    // ============================================================================
    // CACHE METHODS
    // ============================================================================

    /**
     * Get dataset from cache
     *
     * @param numericId - Numeric dataset ID
     * @returns Cached dataset or null if not found
     */
    private async getCachedDataset(numericId: number): Promise<Dataset | null> {
        const cachedDataset =
            await datasetsCacheRepo.getCachedDataset(numericId);
        if (cachedDataset) {
            this.logger.trace({ id: numericId }, "Dataset found in cache");
        }
        return cachedDataset;
    }

    /**
     * Cache a dataset after retrieval
     *
     * @param dataset - Dataset entity to cache
     */
    private async cacheDataset(dataset: Dataset): Promise<void> {
        await datasetsCacheRepo.cacheDataset(dataset.id, dataset);
        this.logger.trace({ id: dataset.id }, "Dataset cached");
    }

    /**
     * Invalidate a cached dataset
     *
     * @param numericId - Numeric dataset ID
     */
    private async invalidateCachedDataset(numericId: number): Promise<void> {
        await datasetsCacheRepo.invalidateCachedDataset(numericId);
        this.logger.trace({ id: numericId }, "Dataset invalidated from cache");
    }

    // ============================================================================
    // QUERY BUILDING METHODS
    // ============================================================================

    /**
     * Build search conditions for dataset queries
     *
     * @param searchQuery - Search query string
     * @returns Where clause with search conditions or undefined
     */
    private buildSearchConditions(
        searchQuery: string
    ): DatasetWhereInput | undefined {
        if (!searchQuery) {
            return undefined;
        }

        const searchConditions: DatasetWhereInput[] = [
            {
                file_name: {
                    contains: searchQuery,
                    mode: "insensitive" as const,
                },
            },
        ];

        // Check if search query matches a valid timeframe
        const upperQ = searchQuery.toUpperCase();
        if (VALID_TIMEFRAMES.includes(upperQ as Timeframe)) {
            searchConditions.push({
                timeframe: {
                    equals: upperQ as Timeframe,
                },
            });
        }

        return { OR: searchConditions };
    }

    // ============================================================================
    // PUBLIC METHODS
    // ============================================================================

    /**
     * Get a dataset by ID with caching
     *
     * Public operation - any authenticated user can read datasets.
     *
     * @param id - Dataset ID
     * @returns Dataset entity
     * @throws NotFoundError if dataset doesn't exist
     */
    async getDatasetById(id: string): Promise<Dataset> {
        const numericId = Number(id);

        // Try to get from cache first
        const cachedDataset = await this.getCachedDataset(numericId);
        if (cachedDataset) {
            return cachedDataset;
        }

        // Fetch from database
        this.logger.trace(
            { id },
            "Dataset not found in cache, fetching from database"
        );
        const dataset = await datasetsRepo.getDatasetById(id);
        if (!dataset) {
            this.logger.debug(
                { id },
                "Dataset not found, throwing not found error"
            );
            throw new NotFoundError("Dataset not found");
        }

        // Cache and return
        await this.cacheDataset(dataset);
        return dataset;
    }

    /**
     * Get all datasets with optional search and pagination
     *
     * Public operation - any authenticated user can list datasets.
     *
     * @param query - Optional search query with pagination and sorting
     * @returns Array of dataset entities
     */
    async getAllDatasets(query?: SearchQuery): Promise<Dataset[]> {
        const {
            q,
            page = PAGINATION_CONSTANTS.DEFAULT_PAGE,
            limit = PAGINATION_CONSTANTS.DEFAULT_PAGE_LIMIT,
            sort,
            order = "desc",
        } = query ?? {};

        // Build where clause
        const where = this.buildSearchConditions(q ?? "");

        // Build order by using shared utility
        const orderBy = buildOrderBy<DatasetSortField>(
            sort,
            order,
            VALID_SORT_FIELDS
        ) as DatasetOrderBy | undefined;

        // Build pagination using shared utility
        const { skip, take } = buildPagination(page, limit);

        // Execute query
        return datasetsRepo.findDatasets({
            where,
            skip,
            take,
            orderBy,
        });
    }

    /**
     * Create a new dataset
     *
     * Admin-only operation.
     *
     * @param dataset - Dataset creation data
     * @param user - User entity making the request (for authorization)
     * @returns Created dataset entity
     * @throws ForbiddenError if user is not admin
     * @throws BadRequestError if validation fails
     * @throws NotFoundError if instrument doesn't exist
     */
    async createDataset(
        dataset: DatasetCreateInput,
        user: User
    ): Promise<Dataset> {
        // Check admin access
        this.ensureAdminAccess(user, "create");

        // Validate business rules
        await this.validateDatasetCreation(dataset);

        this.logger.trace(
            {
                instrument_id: dataset.instrument_id,
                timeframe: dataset.timeframe,
                userId: user.id,
            },
            "Creating dataset"
        );

        const created = await datasetsRepo.createDataset(dataset);
        this.logger.debug({ id: created.id }, "Dataset created");

        await this.cacheDataset(created);
        return created;
    }

    /**
     * Update an existing dataset
     *
     * Admin-only operation.
     *
     * @param id - Dataset ID
     * @param dataset - Dataset update data
     * @param user - User entity making the request (for authorization)
     * @returns Updated dataset entity
     * @throws NotFoundError if dataset doesn't exist
     * @throws ForbiddenError if user is not admin
     * @throws BadRequestError if validation fails
     */
    async updateDataset(
        id: string,
        dataset: DatasetUpdateInput,
        user: User
    ): Promise<Dataset> {
        // Check admin access
        this.ensureAdminAccess(user, "update");

        const existing = await datasetsRepo.getDatasetById(id);
        if (!existing) {
            this.logger.debug(
                { id },
                "Dataset not found, throwing not found error"
            );
            throw new NotFoundError("Dataset not found");
        }

        // Validate business rules
        this.validateDatasetUpdate(dataset, existing);

        const updated = await datasetsRepo.updateDataset(id, dataset);
        this.logger.debug({ id: updated.id }, "Dataset updated");

        await this.cacheDataset(updated);
        return updated;
    }

    /**
     * Delete a dataset
     *
     * Admin-only operation.
     *
     * @param id - Dataset ID
     * @param user - User entity making the request (for authorization)
     * @throws NotFoundError if dataset doesn't exist
     * @throws ForbiddenError if user is not admin
     */
    async deleteDataset(id: string, user: User): Promise<void> {
        // Check admin access
        this.ensureAdminAccess(user, "delete");

        const existing = await datasetsRepo.getDatasetById(id);
        if (!existing) {
            this.logger.debug(
                { id },
                "Dataset not found, throwing not found error"
            );
            throw new NotFoundError("Dataset not found");
        }

        await datasetsRepo.deleteDataset(id);
        this.logger.debug({ id }, "Dataset deleted");

        await this.invalidateCachedDataset(Number(id));
    }

    /**
     * Upload a file for a dataset
     *
     * Uploads the file to MinIO and creates a queue job for processing.
     * Admin-only operation.
     *
     * @param id - Dataset ID
     * @param file - File buffer
     * @param originalFileName - Original file name
     * @param user - User entity making the request (for authorization)
     * @returns Updated dataset entity
     * @throws NotFoundError if dataset doesn't exist
     * @throws ForbiddenError if user is not admin
     */
    async uploadDatasetFile(
        id: string,
        file: Buffer,
        originalFileName: string,
        user: User
    ): Promise<Dataset> {
        // Check admin access
        this.ensureAdminAccess(user, "upload");

        const numericId = Number(id);

        // Fetch dataset to validate it exists and get metadata
        const dataset = await datasetsRepo.getDatasetById(id);
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
            {
                datasetId: numericId,
                filePath,
                fileSize: file.length,
                userId: user.id,
            },
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
        const updatedDataset = await datasetsRepo.updateDataset(id, {
            file_name: originalFileName,
            uploaded_at: new Date().toISOString(),
        });

        // Invalidate cache and re-cache with updated data
        await this.invalidateCachedDataset(numericId);
        await this.cacheDataset(updatedDataset);

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
            { datasetId: numericId, queueJobId, userId: user.id },
            "Dataset file split job queued"
        );

        return updatedDataset;
    }

    /**
     * Upload a chunk of a dataset file
     *
     * Stores chunks temporarily and reassembles the complete file when all chunks are received.
     * Admin-only operation.
     *
     * @param id - Dataset ID
     * @param chunkBuffer - Chunk buffer
     * @param originalFileName - Original file name
     * @param chunkIndex - Index of this chunk (0-based)
     * @param totalChunks - Total number of chunks
     * @param user - User entity making the request (for authorization)
     * @returns Result indicating if upload is complete and how many chunks received
     * @throws NotFoundError if dataset doesn't exist
     * @throws ForbiddenError if user is not admin
     * @throws BadRequestError if chunk index is invalid
     */
    async uploadDatasetFileChunk(
        id: string,
        chunkBuffer: Buffer,
        originalFileName: string,
        chunkIndex: number,
        totalChunks: number,
        user: User
    ): Promise<ChunkUploadResult> {
        // Check admin access
        this.ensureAdminAccess(user, "upload");

        const numericId = Number(id);

        // Validate chunk index
        if (chunkIndex < 0 || chunkIndex >= totalChunks) {
            throw new BadRequestError(
                `Invalid chunk index. Must be between 0 and ${totalChunks - 1}`
            );
        }

        // Fetch dataset to validate it exists
        const dataset = await datasetsRepo.getDatasetById(id);
        if (!dataset) {
            this.logger.debug(
                { id },
                "Dataset not found, throwing not found error"
            );
            throw new NotFoundError("Dataset not found");
        }

        // Create storage key
        const storageKey = `${numericId}-${originalFileName}`;

        // Initialize chunk storage for this upload if needed
        if (!this.chunkStorage.has(storageKey)) {
            this.chunkStorage.set(storageKey, new Map());
        }

        const chunks = this.chunkStorage.get(storageKey)!;

        // Store the chunk
        chunks.set(chunkIndex, {
            buffer: chunkBuffer,
            chunkIndex,
            receivedAt: Date.now(),
        });

        this.logger.debug(
            {
                datasetId: numericId,
                chunkIndex,
                totalChunks,
                receivedChunks: chunks.size,
                userId: user.id,
            },
            "Chunk stored"
        );

        // Check if all chunks have been received
        if (chunks.size === totalChunks) {
            this.logger.info(
                {
                    datasetId: numericId,
                    totalChunks,
                    userId: user.id,
                },
                "All chunks received, reassembling file"
            );

            // Reassemble chunks in order
            const sortedChunks = Array.from(chunks.entries())
                .sort(([a], [b]) => a - b)
                .map(([, data]) => data.buffer);

            const completeFile = Buffer.concat(sortedChunks);

            // Clean up chunk storage
            this.chunkStorage.delete(storageKey);

            // Process the complete file using the existing uploadDatasetFile method
            await this.uploadDatasetFile(
                id,
                completeFile,
                originalFileName,
                user
            );

            return {
                complete: true,
                receivedChunks: totalChunks,
            };
        }

        return {
            complete: false,
            receivedChunks: chunks.size,
        };
    }

    /**
     * Clean up stale chunks that haven't been completed
     *
     * Removes chunks older than 30 minutes to prevent memory leaks.
     */
    private cleanupStaleChunks(): void {
        const now = Date.now();
        const STALE_THRESHOLD = 30 * 60 * 1000; // 30 minutes

        for (const [key, chunks] of this.chunkStorage.entries()) {
            if (chunks.size === 0) {
                this.chunkStorage.delete(key);
                continue;
            }

            // Check if any chunk is stale
            const chunkArray = Array.from(chunks.values());
            const oldestChunk = chunkArray.reduce((oldest, chunk) =>
                chunk.receivedAt < oldest.receivedAt ? chunk : oldest
            );

            if (oldestChunk && now - oldestChunk.receivedAt > STALE_THRESHOLD) {
                this.logger.debug(
                    { storageKey: key, chunksCount: chunks.size },
                    "Cleaning up stale chunks"
                );
                this.chunkStorage.delete(key);
            }
        }
    }
}

export default new DatasetsService();
