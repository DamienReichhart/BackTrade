import { BaseCacheService } from "./base-cache-service";
import type { Dataset } from "@backtrade/datas";
import { DatasetSchema } from "@backtrade/types";

/**
 * Datasets Cache Service
 *
 * Handles caching operations for Dataset entities.
 */
class DatasetsCacheService extends BaseCacheService<Dataset> {
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

export default new DatasetsCacheService({
    prefix: "dataset:",
    ttl: 60 * 10, // 10 minutes
    entityName: "dataset",
    entitySchema: DatasetSchema,
});
