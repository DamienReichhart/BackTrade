import { createCacheService } from "./cache-service-factory";
import type { Dataset } from "../../generated/prisma/client";
import { DatasetSchema } from "@backtrade/types";

const datasetCacheService = createCacheService<Dataset>({
    prefix: "dataset:",
    ttl: 60 * 10, // 10 minutes
    entityName: "dataset",
    entitySchema: DatasetSchema,
});

export default {
    cacheDataset: datasetCacheService.cache,
    getCachedDataset: datasetCacheService.get,
    invalidateCachedDataset: datasetCacheService.invalidate,
};
