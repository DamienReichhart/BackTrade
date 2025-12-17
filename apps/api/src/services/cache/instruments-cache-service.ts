import { BaseCacheService } from "./base-cache-service";
import type { Instrument } from "@backtrade/datas";
import { InstrumentSchema } from "@backtrade/types";

/**
 * Instruments Cache Service
 *
 * Handles caching operations for Instrument entities.
 */
class InstrumentsCacheService extends BaseCacheService<Instrument> {
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

export default new InstrumentsCacheService({
    prefix: "instrument:",
    ttl: 60 * 10, // 10 minutes
    entityName: "instrument",
    entitySchema: InstrumentSchema,
});
