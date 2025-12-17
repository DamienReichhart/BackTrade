/**
 * Datasets Cache Repository
 *
 * Handles caching operations for Dataset entities.
 */

import { BaseCacheRepository } from "./base-cache-repository";
import type { Dataset } from "@backtrade/datas";
import { DatasetSchema } from "@backtrade/types";
import type { Redis } from "ioredis";
import type { Logger } from "@backtrade/logger";

/**
 * Datasets Cache Repository
 *
 * Handles caching operations for Dataset entities.
 */
class DatasetsCacheRepository extends BaseCacheRepository<Dataset> {
    /**
     * Cache a dataset by ID
     * @param id - Dataset ID
     * @param data - Dataset data to cache
     */
    async cacheDataset(id: number, data: Dataset): Promise<void> {
        return this.cache(id, data);
    }

    /**
     * Retrieve a cached dataset by ID
     * @param id - Dataset ID
     * @returns Cached dataset or null if not found
     */
    async getCachedDataset(id: number): Promise<Dataset | null> {
        return this.get(id);
    }

    /**
     * Invalidate a cached dataset by ID
     * @param id - Dataset ID
     */
    async invalidateCachedDataset(id: number): Promise<void> {
        return this.invalidate(id);
    }
}

/**
 * Creates a datasets cache repository instance
 *
 * @param redis - Redis client instance
 * @param logger - Logger instance from the consuming application
 * @returns Datasets cache repository instance
 */
export function createDatasetsCacheRepository(
    redis: Redis,
    logger: Logger
): DatasetsCacheRepository {
    return new DatasetsCacheRepository(
        {
            prefix: "dataset:",
            ttl: 60 * 10, // 10 minutes
            entityName: "dataset",
            entitySchema: DatasetSchema,
        },
        redis,
        logger
    );
}
