/**
 * Cache Repositories
 *
 * Initializes all cache repositories using @backtrade/cache package.
 * Provides singleton instances of all cache repositories for the API application.
 */

import {
    createUsersCacheRepository,
    createCandlesCacheRepository,
    createDatasetsCacheRepository,
    createInstrumentsCacheRepository,
    createSessionsCacheRepository,
    createPositionsCacheRepository,
    createHealthCacheRepository,
} from "@backtrade/cache";
import { redis } from "./redis";
import { logger } from "./pino";

// Initialize all cache repositories
export const usersCacheRepo = createUsersCacheRepository(redis, logger);
export const candlesCacheRepo = createCandlesCacheRepository(redis, logger);
export const datasetsCacheRepo = createDatasetsCacheRepository(redis, logger);
export const instrumentsCacheRepo = createInstrumentsCacheRepository(
    redis,
    logger
);
export const sessionsCacheRepo = createSessionsCacheRepository(redis, logger);
export const positionsCacheRepo = createPositionsCacheRepository(redis, logger);
export const healthCacheRepo = createHealthCacheRepository(redis, logger);
