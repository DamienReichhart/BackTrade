/**
 * Redis Client
 *
 * Redis client instance using @backtrade/cache package.
 * This file provides a singleton Redis client for the API application.
 */

import { createRedisClient } from "@backtrade/cache";
import { logger } from "./pino";

export const redis = createRedisClient(logger);
