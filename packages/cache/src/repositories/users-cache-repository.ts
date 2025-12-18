/**
 * Users Cache Repository
 *
 * Handles caching operations for User entities.
 */

import { BaseCacheRepository } from "./base-cache-repository";
import type { User } from "@backtrade/data";
import { UserSchema } from "@backtrade/types";
import type { Redis } from "ioredis";
import type { Logger } from "@backtrade/logger";

/**
 * Users Cache Repository
 *
 * Handles caching operations for User entities.
 */
class UsersCacheRepository extends BaseCacheRepository<User> {
    /**
     * Cache a user by ID
     * @param id - User ID
     * @param data - User data to cache
     */
    async cacheUser(id: number, data: User): Promise<void> {
        return this.cache(id, data);
    }

    /**
     * Retrieve a cached user by ID
     * @param id - User ID
     * @returns Cached user or null if not found
     */
    async getCachedUser(id: number): Promise<User | null> {
        return this.get(id);
    }

    /**
     * Invalidate a cached user by ID
     * @param id - User ID
     */
    async invalidateCachedUser(id: number): Promise<void> {
        return this.invalidate(id);
    }
}

/**
 * Creates a users cache repository instance
 *
 * @param redis - Redis client instance
 * @param logger - Logger instance from the consuming application
 * @returns Users cache repository instance
 */
export function createUsersCacheRepository(
    redis: Redis,
    logger: Logger
): UsersCacheRepository {
    return new UsersCacheRepository(
        {
            prefix: "user:",
            ttl: 60 * 10, // 10 minutes
            entityName: "user",
            entitySchema: UserSchema,
        },
        redis,
        logger
    );
}
