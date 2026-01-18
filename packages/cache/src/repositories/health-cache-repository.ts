/**
 * Health Cache Repository
 *
 * Handles caching operations for Health status entities.
 */

import { BaseCacheRepository } from "./base-cache-repository";
import { HealthSchema, type Health } from "@backtrade/types";
import type { Redis } from "ioredis";
import type { Logger } from "@backtrade/logger";

/**
 * Health Cache Repository
 *
 * Handles caching operations for Health status entities.
 */
class HealthCacheRepository extends BaseCacheRepository<Health> {
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

/**
 * Creates a health cache repository instance
 *
 * @param redis - Redis client instance
 * @param logger - Logger instance from the consuming application
 * @returns Health cache repository instance
 */
export function createHealthCacheRepository(
    redis: Redis,
    logger: Logger
): HealthCacheRepository {
    return new HealthCacheRepository(
        {
            prefix: "health:",
            ttl: 60, // 1 minute
            entityName: "health",
            entitySchema: HealthSchema,
        },
        redis,
        logger
    );
}
