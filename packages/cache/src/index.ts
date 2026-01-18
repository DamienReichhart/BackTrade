/**
 * @backtrade/cache
 *
 * Shared cache package for BackTrade.
 * Contains Redis client initialization and cache repositories.
 */

// Redis client factory
export { createRedisClient } from "./libs/redis";

// Base cache repository
export { BaseCacheRepository } from "./repositories";
export type { CacheRepositoryConfig } from "./repositories";

// All cache repository factories
export {
    createUsersCacheRepository,
    createCandlesCacheRepository,
    createDatasetsCacheRepository,
    createInstrumentsCacheRepository,
    createSessionsCacheRepository,
    createPositionsCacheRepository,
    createTransactionsCacheRepository,
    createHealthCacheRepository,
} from "./repositories";
