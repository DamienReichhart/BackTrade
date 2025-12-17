/**
 * Candles Cache Repository
 *
 * Handles caching operations for Candle entities.
 */

import { BaseCacheRepository } from "./base-cache-repository";
import type { Candle } from "@backtrade/datas";
import { CandleSchema } from "@backtrade/types";
import type { Redis } from "ioredis";
import type { Logger } from "@backtrade/logger";

/**
 * Candles Cache Repository
 *
 * Handles caching operations for Candle entities.
 */
class CandlesCacheRepository extends BaseCacheRepository<Candle> {
    /**
     * Cache a candle by ID
     * @param id - Candle ID
     * @param data - Candle data to cache
     */
    async cacheCandle(id: number, data: Candle): Promise<void> {
        return this.cache(id, data);
    }

    /**
     * Retrieve a cached candle by ID
     * @param id - Candle ID
     * @returns Cached candle or null if not found
     */
    async getCachedCandle(id: number): Promise<Candle | null> {
        return this.get(id);
    }

    /**
     * Invalidate a cached candle by ID
     * @param id - Candle ID
     */
    async invalidateCachedCandle(id: number): Promise<void> {
        return this.invalidate(id);
    }
}

/**
 * Creates a candles cache repository instance
 *
 * @param redis - Redis client instance
 * @param logger - Logger instance from the consuming application
 * @returns Candles cache repository instance
 */
export function createCandlesCacheRepository(
    redis: Redis,
    logger: Logger
): CandlesCacheRepository {
    return new CandlesCacheRepository(
        {
            prefix: "candle:",
            ttl: 60 * 10, // 10 minutes
            entityName: "candle",
            entitySchema: CandleSchema,
        },
        redis,
        logger
    );
}
