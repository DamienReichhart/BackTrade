import { logger } from "../../libs/pino";
import { redis } from "../../libs/redis";

/**
 * Configuration options for creating a cache service
 */
export interface CacheServiceConfig {
  /** Redis key prefix (e.g., "user:", "session:") */
  prefix: string;
  /** Time to live in seconds */
  ttl: number;
  /** Entity name for error logging (e.g., "user", "session") */
  entityName: string;
}

/**
 * Cache service interface with standard CRUD operations
 */
export interface CacheService<T> {
  /**
   * Cache an entity by its ID
   * @param id - The entity ID
   * @param data - The entity data to cache
   */
  cache(id: number, data: T): Promise<void>;

  /**
   * Retrieve a cached entity by its ID
   * @param id - The entity ID
   * @returns The cached entity or null if not found
   */
  get(id: number): Promise<T | null>;

  /**
   * Invalidate (delete) a cached entity by its ID
   * @param id - The entity ID
   */
  invalidate(id: number): Promise<void>;
}

/**
 * Factory function to create a cache service for any entity type
 *
 * @param config - Configuration object with prefix, TTL, and entity name
 * @returns A cache service object with cache, get, and invalidate methods
 *
 * @example
 * ```typescript
 * const userCacheService = createCacheService<User>({
 *   prefix: "user:",
 *   ttl: 60 * 5, // 5 minutes
 *   entityName: "user"
 * });
 * ```
 */
export function createCacheService<T>(
  config: CacheServiceConfig,
): CacheService<T> {
  const { prefix, ttl, entityName } = config;

  async function cache(id: number, data: T): Promise<void> {
    try {
      await redis.set(`${prefix}${id}`, JSON.stringify(data), "EX", ttl);
    } catch (error) {
      logger.error({ error }, `Error caching ${entityName}`);
      throw error;
    }
  }

  async function get(id: number): Promise<T | null> {
    try {
      const result = await redis.get(`${prefix}${id}`);
      return result ? (JSON.parse(result) as T) : null;
    } catch (error) {
      logger.error({ error }, `Error getting cached ${entityName}`);
      throw error;
    }
  }

  async function invalidate(id: number): Promise<void> {
    try {
      await redis.del(`${prefix}${id}`);
    } catch (error) {
      logger.error({ error }, `Error invalidating cached ${entityName}`);
      throw error;
    }
  }

  return {
    cache,
    get,
    invalidate,
  };
}
