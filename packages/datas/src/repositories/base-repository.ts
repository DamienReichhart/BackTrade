/**
 * Base Postgres Repository
 *
 * Shared base class for all PostgreSQL data access repositories in @backtrade/datas.
 * Provides access to the Prisma client singleton and common helpers.
 */

import type { PrismaClient } from "../generated/prisma/client";
import { prisma } from "../libs/prisma";

/**
 * Abstract base repository providing shared Prisma access and utilities for PostgreSQL.
 */
abstract class BasePostgresRepository {
    /**
     * Shared Prisma client instance for all repositories.
     *
     * Subclasses should use this for all database operations.
     */
    protected readonly prisma: PrismaClient;

    /**
     * Initialize the repository with the shared Prisma client.
     */
    constructor() {
        this.prisma = prisma;
    }

    /**
     * Normalize an ID value to a numeric ID.
     *
     * This mirrors the previous behavior of calling `Number(id)` at call sites
     * without adding additional validation, to keep runtime semantics identical.
     *
     * @param id - Identifier as number or string
     * @returns Numeric representation of the ID
     */
    protected toNumericId(id: number | string): number {
        return typeof id === "number" ? id : Number(id);
    }
}

/**
 * @deprecated Use BasePostgresRepository instead. This export is kept for backward compatibility.
 */
const BaseRepository = BasePostgresRepository;

export { BasePostgresRepository, BaseRepository };
