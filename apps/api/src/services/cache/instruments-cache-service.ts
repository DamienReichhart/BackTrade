import { createCacheService } from "./cache-service-factory";
import type { Instrument } from "../../generated/prisma/client";
import { InstrumentSchema } from "@backtrade/types";

const instrumentCacheService = createCacheService<Instrument>({
    prefix: "instrument:",
    ttl: 60 * 10, // 10 minutes
    entityName: "instrument",
    entitySchema: InstrumentSchema,
});

// Export with backward-compatible method names
export default {
    cacheInstrument: instrumentCacheService.cache,
    getCachedInstrument: instrumentCacheService.get,
    invalidateCachedInstrument: instrumentCacheService.invalidate,
};
