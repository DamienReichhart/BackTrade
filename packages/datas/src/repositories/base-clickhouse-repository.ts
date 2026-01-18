/**
 * Base ClickHouse Repository
 *
 * Shared base class for all ClickHouse data access repositories in @backtrade/data.
 * Provides access to the ClickHouse client singleton and common helpers.
 */

import type { ClickHouseClient } from "@clickhouse/client";
import { clickhouse } from "../libs/clickhouse";

/**
 * Abstract base repository providing shared ClickHouse client access and utilities.
 */
abstract class BaseClickHouseRepository {
    /**
     * Shared ClickHouse client instance for all repositories.
     *
     * Subclasses should use this for all database operations.
     */
    protected readonly clickhouse: ClickHouseClient;

    /**
     * Initialize the repository with the shared ClickHouse client.
     */
    constructor() {
        this.clickhouse = clickhouse;
    }

    /**
     * Normalize an ID value to a numeric ID.
     *
     * @param id - Identifier as number or string
     * @returns Numeric representation of the ID
     */
    protected toNumericId(id: number | string): number {
        return typeof id === "number" ? id : Number(id);
    }

    /**
     * Format a date for ClickHouse queries.
     *
     * @param date - Date string or Date object
     * @returns Formatted date string for ClickHouse
     */
    protected formatDate(date: string | Date): string {
        const dateObj = typeof date === "string" ? new Date(date) : date;
        return dateObj.toISOString().replace("T", " ").replace("Z", "");
    }
}

export { BaseClickHouseRepository };
