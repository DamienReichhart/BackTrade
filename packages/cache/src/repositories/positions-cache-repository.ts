/**
 * Positions Cache Repository
 *
 * Handles caching operations for Position entities.
 */

import { BaseCacheRepository } from "./base-cache-repository";
import type { Position } from "@backtrade/data";
import { PositionSchema } from "@backtrade/types";
import type { Redis } from "ioredis";
import type { Logger } from "@backtrade/logger";

/**
 * Positions Cache Repository
 *
 * Handles caching operations for Position entities.
 */
class PositionsCacheRepository extends BaseCacheRepository<Position> {
    /**
     * Cache a position by ID
     * @param id - Position ID
     * @param data - Position data to cache
     */
    async cachePosition(id: number, data: Position): Promise<void> {
        return this.cache(id, data);
    }

    /**
     * Retrieve a cached position by ID
     * @param id - Position ID
     * @returns Cached position or null if not found
     */
    async getCachedPosition(id: number): Promise<Position | null> {
        return this.get(id);
    }

    /**
     * Invalidate a cached position by ID
     * @param id - Position ID
     */
    async invalidateCachedPosition(id: number): Promise<void> {
        return this.invalidate(id);
    }
}

/**
 * Creates a positions cache repository instance
 *
 * @param redis - Redis client instance
 * @param logger - Logger instance from the consuming application
 * @returns Positions cache repository instance
 */
export function createPositionsCacheRepository(
    redis: Redis,
    logger: Logger
): PositionsCacheRepository {
    return new PositionsCacheRepository(
        {
            prefix: "position:",
            ttl: 60 * 10, // 10 minutes
            entityName: "position",
            entitySchema: PositionSchema,
        },
        redis,
        logger
    );
}
