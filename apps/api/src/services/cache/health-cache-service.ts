import { createCacheService } from "./cache-service-factory";
import { HealthSchema, type Health } from "@backtrade/types";

const healthCacheService = createCacheService<Health>({
    prefix: "health:",
    ttl: 60, // 1 minute
    entityName: "health",
    entitySchema: HealthSchema,
});

export default {
    cacheHealth: healthCacheService.cache,
    getCachedHealth: healthCacheService.get,
    invalidateCachedHealth: healthCacheService.invalidate,
};
