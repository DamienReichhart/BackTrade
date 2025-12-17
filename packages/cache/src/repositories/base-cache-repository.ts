/**
 * Base Cache Repository
 *
 * Abstract base class for all cache repositories providing common Redis operations.
 * Implements the standard cache interface with error handling and logging.
 */

import type { Logger } from "@backtrade/logger";
import type { Redis } from "ioredis";
import type { z } from "zod";

/**
 * Configuration options for cache repositories
 */
export interface CacheRepositoryConfig {
    /** Redis key prefix (e.g., "user:", "session:") */
    prefix: string;
    /** Time to live in seconds */
    ttl: number;
    /** Entity name for error logging (e.g., "user", "session") */
    entityName: string;
    /** Schema for the entity validation */
    entitySchema: z.ZodType<unknown>;
}

/**
 * Base class for cache repositories
 *
 * Provides common Redis operations with error handling and logging.
 * Can be extended by specific cache repositories or used directly.
 *
 * @template T - The entity type being cached
 */
export class BaseCacheRepository<T> {
    protected readonly prefix: string;
    protected readonly ttl: number;
    protected readonly entityName: string;
    protected readonly entitySchema: z.ZodType<unknown>;
    protected readonly logger: ReturnType<Logger["child"]>;
    protected readonly redis: Redis;

    /**
     * Creates a new cache repository instance
     *
     * @param config - Configuration object with prefix, TTL, entity name, and schema
     * @param redis - Redis client instance
     * @param logger - Logger instance from the consuming application
     */
    constructor(config: CacheRepositoryConfig, redis: Redis, logger: Logger) {
        this.prefix = config.prefix;
        this.ttl = config.ttl;
        this.entityName = config.entityName;
        this.entitySchema = config.entitySchema;
        this.redis = redis;
        this.logger = logger.child({
            service: "cache",
            entity: this.entityName,
        });
    }

    /**
     * Cache an entity by its ID
     *
     * @param id - The entity ID
     * @param data - The entity data to cache
     */
    async cache(id: number, data: T): Promise<void> {
        try {
            await this.redis.set(
                `${this.prefix}${id}`,
                JSON.stringify(data),
                "EX",
                this.ttl
            );
        } catch (error) {
            this.logger.warn(
                { error, id, entityName: this.entityName },
                `Failed to cache ${this.entityName} - continuing without cache`
            );
        }
    }

    /**
     * Retrieve a cached entity by its ID
     *
     * @param id - The entity ID
     * @returns The cached entity or null if not found
     */
    async get(id: number): Promise<T | null> {
        try {
            const result = await this.redis.get(`${this.prefix}${id}`);
            return result
                ? (this.entitySchema.parse(JSON.parse(result)) as T)
                : null;
        } catch (error) {
            this.logger.warn(
                { error, id, entityName: this.entityName },
                `Failed to get cached ${this.entityName} - will fetch from database`
            );
            return null;
        }
    }

    /**
     * Invalidate (delete) a cached entity by its ID
     *
     * @param id - The entity ID
     */
    async invalidate(id: number): Promise<void> {
        try {
            await this.redis.del(`${this.prefix}${id}`);
        } catch (error) {
            this.logger.warn(
                { error, id, entityName: this.entityName },
                `Failed to invalidate cached ${this.entityName} - continuing without cache invalidation`
            );
        }
    }
}
