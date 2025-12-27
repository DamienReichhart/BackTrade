/**
 * Cache Repositories Module
 *
 * Central export point for all cache repository factory functions.
 */

export { BaseCacheRepository } from "./base-cache-repository";
export type { CacheRepositoryConfig } from "./base-cache-repository";

export { createUsersCacheRepository } from "./users-cache-repository";
export { createCandlesCacheRepository } from "./candles-cache-repository";
export { createDatasetsCacheRepository } from "./datasets-cache-repository";
export { createInstrumentsCacheRepository } from "./instruments-cache-repository";
export { createSessionsCacheRepository } from "./sessions-cache-repository";
export { createPositionsCacheRepository } from "./positions-cache-repository";
export { createTransactionsCacheRepository } from "./transactions-cache-repository";
export { createHealthCacheRepository } from "./health-cache-repository";
