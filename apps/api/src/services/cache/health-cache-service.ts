import { BaseCacheService } from "./base-cache-service";
import { HealthSchema, type Health } from "@backtrade/types";

/**
 * Health Cache Service
 *
 * Handles caching operations for Health status entities.
 */
class HealthCacheService extends BaseCacheService<Health> {
    /**
     * Cache health status by ID
     * @param id - Health status ID
     * @param data - Health status data to cache
     */
    async cacheHealth(id: number, data: Health): Promise<void> {
        return this.cache(id, data);
    }

    /**
     * Retrieve cached health status by ID
     * @param id - Health status ID
     * @returns Cached health status or null if not found
     */
    async getCachedHealth(id: number): Promise<Health | null> {
        return this.get(id);
    }

    /**
     * Invalidate cached health status by ID
     * @param id - Health status ID
     */
    async invalidateCachedHealth(id: number): Promise<void> {
        return this.invalidate(id);
    }
}

export default new HealthCacheService({
    prefix: "health:",
    ttl: 60, // 1 minute
    entityName: "health",
    entitySchema: HealthSchema,
});
