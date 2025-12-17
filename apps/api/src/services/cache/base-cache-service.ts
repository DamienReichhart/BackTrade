/**
 * Base Cache Service
 *
 * Abstract base class for all cache services providing common Redis operations.
 * Implements the standard cache interface with error handling and logging.
 */

import { logger } from "../../libs/pino";
import { redis } from "../../libs/redis";
import type { z } from "zod";

/**
 * Configuration options for cache services
 */
export interface CacheServiceConfig {
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
 * Base class for cache services
 *
 * Provides common Redis operations with error handling and logging.
 * Can be extended by specific cache services or used directly.
 *
 * @template T - The entity type being cached
 */
export class BaseCacheService<T> {
    protected readonly prefix: string;
    protected readonly ttl: number;
    protected readonly entityName: string;
    protected readonly entitySchema: z.ZodType<unknown>;
    protected readonly logger: ReturnType<typeof logger.child>;

    /**
     * Creates a new cache service instance
     *
     * @param config - Configuration object with prefix, TTL, entity name, and schema
     */
    constructor(config: CacheServiceConfig) {
        this.prefix = config.prefix;
        this.ttl = config.ttl;
        this.entityName = config.entityName;
        this.entitySchema = config.entitySchema;
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
            await redis.set(
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
            const result = await redis.get(`${this.prefix}${id}`);
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
            await redis.del(`${this.prefix}${id}`);
        } catch (error) {
            this.logger.warn(
                { error, id, entityName: this.entityName },
                `Failed to invalidate cached ${this.entityName} - continuing without cache invalidation`
            );
        }
    }
}
