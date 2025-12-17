import { BaseCacheService } from "./base-cache-service";
import type { Candle } from "@backtrade/datas";
import { CandleSchema } from "@backtrade/types";

/**
 * Candles Cache Service
 *
 * Handles caching operations for Candle entities.
 */
class CandlesCacheService extends BaseCacheService<Candle> {
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

export default new CandlesCacheService({
    prefix: "candle:",
    ttl: 60 * 10, // 10 minutes
    entityName: "candle",
    entitySchema: CandleSchema,
});
