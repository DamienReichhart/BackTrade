import { BaseCacheService } from "./base-cache-service";
import type { User } from "@backtrade/datas";
import { UserSchema } from "@backtrade/types";

/**
 * Users Cache Service
 *
 * Handles caching operations for User entities.
 */
class UsersCacheService extends BaseCacheService<User> {
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

export default new UsersCacheService({
    prefix: "user:",
    ttl: 60 * 10, // 10 minutes
    entityName: "user",
    entitySchema: UserSchema,
});
