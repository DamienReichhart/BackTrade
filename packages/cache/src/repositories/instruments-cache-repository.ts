/**
 * Instruments Cache Repository
 *
 * Handles caching operations for Instrument entities.
 */

import { BaseCacheRepository } from "./base-cache-repository";
import type { Instrument } from "@backtrade/datas";
import { InstrumentSchema } from "@backtrade/types";
import type { Redis } from "ioredis";
import type { Logger } from "@backtrade/logger";

/**
 * Instruments Cache Repository
 *
 * Handles caching operations for Instrument entities.
 */
class InstrumentsCacheRepository extends BaseCacheRepository<Instrument> {
    /**
     * Cache an instrument by ID
     * @param id - Instrument ID
     * @param data - Instrument data to cache
     */
    async cacheInstrument(id: number, data: Instrument): Promise<void> {
        return this.cache(id, data);
    }

    /**
     * Retrieve a cached instrument by ID
     * @param id - Instrument ID
     * @returns Cached instrument or null if not found
     */
    async getCachedInstrument(id: number): Promise<Instrument | null> {
        return this.get(id);
    }

    /**
     * Invalidate a cached instrument by ID
     * @param id - Instrument ID
     */
    async invalidateCachedInstrument(id: number): Promise<void> {
        return this.invalidate(id);
    }
}

/**
 * Creates an instruments cache repository instance
 *
 * @param redis - Redis client instance
 * @param logger - Logger instance from the consuming application
 * @returns Instruments cache repository instance
 */
export function createInstrumentsCacheRepository(
    redis: Redis,
    logger: Logger
): InstrumentsCacheRepository {
    return new InstrumentsCacheRepository(
        {
            prefix: "instrument:",
            ttl: 60 * 10, // 10 minutes
            entityName: "instrument",
            entitySchema: InstrumentSchema,
        },
        redis,
        logger
    );
}
