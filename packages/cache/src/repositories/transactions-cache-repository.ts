/**
 * Transactions Cache Repository
 *
 * Handles caching operations for Transaction entities.
 */

import { BaseCacheRepository } from "./base-cache-repository";
import type { Transaction } from "@backtrade/data";
import { TransactionSchema } from "@backtrade/types";
import type { Redis } from "ioredis";
import type { Logger } from "@backtrade/logger";

/**
 * Transactions Cache Repository
 *
 * Handles caching operations for Transaction entities.
 */
class TransactionsCacheRepository extends BaseCacheRepository<Transaction> {
    /**
     * Cache a transaction by ID
     * @param id - Transaction ID
     * @param data - Transaction data to cache
     */
    async cacheTransaction(id: number, data: Transaction): Promise<void> {
        return this.cache(id, data);
    }

    /**
     * Retrieve a cached transaction by ID
     * @param id - Transaction ID
     * @returns Cached transaction or null if not found
     */
    async getCachedTransaction(id: number): Promise<Transaction | null> {
        return this.get(id);
    }

    /**
     * Invalidate a cached transaction by ID
     * @param id - Transaction ID
     */
    async invalidateCachedTransaction(id: number): Promise<void> {
        return this.invalidate(id);
    }
}

/**
 * Creates a transactions cache repository instance
 *
 * @param redis - Redis client instance
 * @param logger - Logger instance from the consuming application
 * @returns Transactions cache repository instance
 */
export function createTransactionsCacheRepository(
    redis: Redis,
    logger: Logger
): TransactionsCacheRepository {
    return new TransactionsCacheRepository(
        {
            prefix: "transaction:",
            ttl: 60 * 10, // 10 minutes
            entityName: "transaction",
            entitySchema: TransactionSchema,
        },
        redis,
        logger
    );
}
