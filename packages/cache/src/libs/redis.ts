/**
 * Redis Client Initialization
 *
 * Redis client singleton for the @backtrade/cache package.
 * Reads Redis configuration from environment variables.
 * Accepts a logger instance for dependency injection.
 */

import Redis from "ioredis";
import type { Logger } from "@backtrade/logger";
import { ENV } from "../config/ENV";

/**
 * Creates a Redis client instance with proper error handling
 *
 * @param logger - Logger instance from the consuming application
 * @returns Configured Redis client instance
 */
export function createRedisClient(logger: Logger): Redis {
    const redisLogger = logger.child({
        service: "redis",
    });

    const redis = new Redis({
        host: ENV.REDIS_HOST,
        port: ENV.REDIS_PORT,
        maxRetriesPerRequest: null,
        password: ENV.REDIS_PASSWORD,
        retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000); // 50ms * times, max 2000ms
            return delay;
        },
        reconnectOnError: (err) => {
            const targetError = "READONLY";
            if (err.message.includes(targetError)) {
                return true;
            }
            return false;
        },
        // Prevent Redis from crashing the application
        enableOfflineQueue: false,
        lazyConnect: false,
    });

    // Handle errors gracefully - prevent unhandled errors from crashing the app
    redis.on("error", (err) => {
        redisLogger.error(
            { err },
            "Redis connection error - application will continue without caching"
        );
    });

    redis.on("connect", () => {
        redisLogger.info("Connected successfully");
    });

    redis.on("ready", () => {
        redisLogger.info("Ready to accept commands");
    });

    // Prevent unhandled promise rejections from Redis operations
    redis.on("close", () => {
        redisLogger.warn(
            "Redis connection closed - application will continue without caching"
        );
    });

    redis.on("reconnecting", (delay: string) => {
        redisLogger.info({ delay }, "Reconnecting");
    });

    return redis;
}
