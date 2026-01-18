/**
 * Sessions Cache Repository
 *
 * Handles caching operations for Session entities.
 */

import { BaseCacheRepository } from "./base-cache-repository";
import type { Session } from "@backtrade/data";
import { SessionSchema } from "@backtrade/types";
import type { Redis } from "ioredis";
import type { Logger } from "@backtrade/logger";

/**
 * Sessions Cache Repository
 *
 * Handles caching operations for Session entities.
 */
class SessionsCacheRepository extends BaseCacheRepository<Session> {
    /**
     * Cache a session by ID
     * @param id - Session ID
     * @param data - Session data to cache
     */
    async cacheSession(id: number, data: Session): Promise<void> {
        return this.cache(id, data);
    }

    /**
     * Retrieve a cached session by ID
     * @param id - Session ID
     * @returns Cached session or null if not found
     */
    async getCachedSession(id: number): Promise<Session | null> {
        return this.get(id);
    }

    /**
     * Invalidate a cached session by ID
     * @param id - Session ID
     */
    async invalidateCachedSession(id: number): Promise<void> {
        return this.invalidate(id);
    }
}

/**
 * Creates a sessions cache repository instance
 *
 * @param redis - Redis client instance
 * @param logger - Logger instance from the consuming application
 * @returns Sessions cache repository instance
 */
export function createSessionsCacheRepository(
    redis: Redis,
    logger: Logger
): SessionsCacheRepository {
    return new SessionsCacheRepository(
        {
            prefix: "session:",
            ttl: 60 * 10, // 10 minutes
            entityName: "session",
            entitySchema: SessionSchema,
        },
        redis,
        logger
    );
}
