import { createCacheService } from "./cache-service-factory";
import type { Health } from "@backtrade/types";

const healthCacheService = createCacheService<Health>({
    prefix: "health:",
    ttl: 60, // 1 minute
    entityName: "health",
});

export default {
    cacheHealth: healthCacheService.cache,
    getCachedHealth: healthCacheService.get,
    invalidateCachedHealth: healthCacheService.invalidate,
};
