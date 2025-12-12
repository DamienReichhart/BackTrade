import { createCacheService } from "./cache-service-factory";
import type { Candle } from "../../generated/prisma/client";
import { CandleSchema } from "@backtrade/types";

const candleCacheService = createCacheService<Candle>({
    prefix: "candle:",
    ttl: 60 * 10, // 10 minutes
    entityName: "candle",
    entitySchema: CandleSchema,
});

export default {
    cacheCandle: candleCacheService.cache,
    getCachedCandle: candleCacheService.get,
    invalidateCachedCandle: candleCacheService.invalidate,
};
