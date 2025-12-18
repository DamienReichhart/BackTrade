/**
 * Candle Repository
 *
 * Data access layer for Candle (market data) model operations.
 * Uses ClickHouse for time-series data storage.
 */

import type {
    Candle,
    CandleWhereInput,
    CandleCreateInput,
    CandleOrderBy,
} from "@backtrade/types";
import { BaseClickHouseRepository } from "./base-clickhouse-repository";

export interface FindAllOptions {
    where?: CandleWhereInput;
    skip?: number;
    take?: number;
    orderBy?: CandleOrderBy;
}

/**
 * Repository for Candle model CRUD operations with pagination and sorting.
 * Uses ClickHouse for efficient time-series data storage and querying.
 */
class CandlesRepository extends BaseClickHouseRepository {
    /**
     * Build WHERE clause from CandleWhereInput
     *
     * @param where - Filter conditions
     * @returns SQL WHERE clause and parameters
     */
    private buildWhereClause(where?: CandleWhereInput): {
        clause: string;
        params: Record<string, unknown>;
    } {
        if (!where) {
            return { clause: "", params: {} };
        }

        const conditions: string[] = [];
        const params: Record<string, unknown> = {};

        if (where.instrument_id) {
            if (where.instrument_id.equals !== undefined) {
                conditions.push("instrument_id = {instrument_id:UInt32}");
                params.instrument_id = where.instrument_id.equals;
            }
            if (where.instrument_id.in) {
                // Validate and ensure all values are integers
                const instrumentIds = where.instrument_id.in.map((id) => {
                    const numId = typeof id === "number" ? id : Number(id);
                    if (isNaN(numId) || !Number.isInteger(numId)) {
                        throw new Error(
                            `Invalid instrument_id value: ${id}. Expected integer.`
                        );
                    }
                    return numId;
                });
                conditions.push(
                    "instrument_id IN {instrument_ids:Array(UInt32)}"
                );
                params.instrument_ids = instrumentIds;
            }
        }

        if (where.timeframe) {
            if (where.timeframe.equals !== undefined) {
                conditions.push("timeframe = {timeframe:String}");
                params.timeframe = where.timeframe.equals;
            }
            if (where.timeframe.in) {
                // Use parameterized query for security
                conditions.push("timeframe IN {timeframes:Array(String)}");
                params.timeframes = where.timeframe.in;
            }
        }

        if (where.ts) {
            if (where.ts.gte !== undefined) {
                conditions.push("ts >= {ts_gte:DateTime}");
                params.ts_gte = where.ts.gte;
            }
            if (where.ts.lte !== undefined) {
                conditions.push("ts <= {ts_lte:DateTime}");
                params.ts_lte = where.ts.lte;
            }
            if (where.ts.gt !== undefined) {
                conditions.push("ts > {ts_gt:DateTime}");
                params.ts_gt = where.ts.gt;
            }
            if (where.ts.lt !== undefined) {
                conditions.push("ts < {ts_lt:DateTime}");
                params.ts_lt = where.ts.lt;
            }
            if (where.ts.equals !== undefined) {
                conditions.push("ts = {ts_equals:DateTime}");
                params.ts_equals = where.ts.equals;
            }
        }

        if (where.OR) {
            const orResults = where.OR.map((or) => this.buildWhereClause(or));
            const orConditions = orResults
                .map((result) => result.clause)
                .filter((clause) => clause.length > 0);
            if (orConditions.length > 0) {
                // Merge params from all OR conditions
                orResults.forEach((result) => {
                    Object.assign(params, result.params);
                });
                conditions.push(`(${orConditions.join(" OR ")})`);
            }
        }

        if (where.AND) {
            const andResults = Array.isArray(where.AND)
                ? where.AND.map((and) => this.buildWhereClause(and))
                : [this.buildWhereClause(where.AND)];
            const andConditions = andResults
                .map((result) => result.clause)
                .filter((clause) => clause.length > 0);
            if (andConditions.length > 0) {
                // Merge params from all AND conditions
                andResults.forEach((result) => {
                    Object.assign(params, result.params);
                });
                conditions.push(`(${andConditions.join(" AND ")})`);
            }
        }

        const clause =
            conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

        return { clause, params };
    }

    /**
     * Build ORDER BY clause from CandleOrderBy
     *
     * @param orderBy - Sort options
     * @returns SQL ORDER BY clause
     */
    private buildOrderByClause(orderBy?: CandleOrderBy): string {
        if (!orderBy) {
            return "ORDER BY ts DESC";
        }

        // Whitelist of valid Candle field names to prevent SQL injection
        const validFields = [
            "instrument_id",
            "timeframe",
            "ts",
            "open",
            "high",
            "low",
            "close",
            "volume",
            "created_at",
            "updated_at",
        ] as const;

        const orderByParts: string[] = [];
        for (const [field, direction] of Object.entries(orderBy)) {
            // Validate field name against whitelist
            if (
                validFields.includes(field as (typeof validFields)[number]) &&
                (direction === "asc" || direction === "desc")
            ) {
                orderByParts.push(`${field} ${direction.toUpperCase()}`);
            }
        }

        return orderByParts.length > 0
            ? `ORDER BY ${orderByParts.join(", ")}`
            : "ORDER BY ts DESC";
    }

    /**
     * Get all candles matching optional filter, pagination, and sorting.
     *
     * @param options - Optional filter, pagination, and sorting options
     * @returns Array of matching candles
     */
    async getAllCandles(options?: FindAllOptions): Promise<Candle[]> {
        const { where, skip, take, orderBy } = options ?? {};

        const { clause: whereClause, params } = this.buildWhereClause(where);
        const orderByClause = this.buildOrderByClause(orderBy);

        // Validate and sanitize LIMIT values to prevent SQL injection
        let limitClause = "";
        if (take !== undefined) {
            const offset = skip ?? 0;
            // Validate that offset and take are non-negative integers
            const validatedOffset =
                Number.isInteger(offset) && offset >= 0 ? offset : 0;
            const validatedTake =
                Number.isInteger(take) && take > 0 ? take : 20;
            limitClause = `LIMIT ${validatedOffset}, ${validatedTake}`;
        } else if (skip !== undefined) {
            // Validate that skip is a non-negative integer
            const validatedSkip =
                Number.isInteger(skip) && skip >= 0 ? skip : 0;
            limitClause = `LIMIT ${validatedSkip}, 3000`; // Default limit if only skip is provided
        }

        const query = `
            SELECT 
                instrument_id,
                timeframe,
                ts,
                open,
                high,
                low,
                close,
                volume,
                created_at,
                updated_at
            FROM candles
            ${whereClause}
            ${orderByClause}
            ${limitClause}
        `.trim();

        try {
            const resultSet = await this.clickhouse.query({
                query,
                query_params: params,
                format: "JSONEachRow",
            });

            const data = (await resultSet.json()) as Candle[];
            return data.map((candle) => ({
                ...candle,
                ts:
                    typeof candle.ts === "string"
                        ? candle.ts
                        : new Date(candle.ts).toISOString(),
                created_at:
                    candle.created_at?.toString() ?? new Date().toISOString(),
                updated_at:
                    candle.updated_at?.toString() ?? new Date().toISOString(),
            }));
        } catch (error) {
            throw new Error(
                `Failed to fetch candles from ClickHouse: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }

    /**
     * Create a new candle.
     *
     * @param data - Candle creation data
     * @returns Created candle entity
     */
    async createCandle(data: CandleCreateInput): Promise<Candle> {
        const now = new Date().toISOString();
        const candleData: Candle = {
            instrument_id: data.instrument_id!,
            timeframe: data.timeframe!,
            ts: data.ts!,
            open: data.open!,
            high: data.high!,
            low: data.low!,
            close: data.close!,
            volume: data.volume ?? 0,
            created_at: (data as Candle).created_at ?? now,
            updated_at: (data as Candle).updated_at ?? now,
        };

        try {
            await this.clickhouse.insert({
                table: "candles",
                values: [
                    {
                        instrument_id: candleData.instrument_id,
                        timeframe: candleData.timeframe,
                        ts: candleData.ts,
                        open: Number(candleData.open),
                        high: Number(candleData.high),
                        low: Number(candleData.low),
                        close: Number(candleData.close),
                        volume: Number(candleData.volume),
                        created_at: candleData.created_at,
                        updated_at: candleData.updated_at,
                    },
                ],
                format: "JSONEachRow",
            });

            return candleData;
        } catch (error) {
            throw new Error(
                `Failed to create candle in ClickHouse: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }

    /**
     * Bulk insert candles for better performance.
     *
     * @param data - Array of candle creation data
     * @returns Number of inserted candles
     */
    async createCandlesBulk(data: CandleCreateInput[]): Promise<number> {
        if (data.length === 0) {
            return 0;
        }

        const now = new Date().toISOString();
        const candles: Candle[] = data.map((item) => {
            const candle = item as Partial<Candle>;
            return {
                instrument_id: item.instrument_id!,
                timeframe: item.timeframe!,
                ts: item.ts!,
                open: item.open!,
                high: item.high!,
                low: item.low!,
                close: item.close!,
                volume: item.volume ?? 0,
                created_at: candle.created_at ?? now,
                updated_at: candle.updated_at ?? now,
            };
        });

        try {
            await this.clickhouse.insert({
                table: "candles",
                values: candles.map((candle) => ({
                    instrument_id: candle.instrument_id,
                    timeframe: candle.timeframe,
                    ts: candle.ts,
                    open: Number(candle.open),
                    high: Number(candle.high),
                    low: Number(candle.low),
                    close: Number(candle.close),
                    volume: Number(candle.volume),
                    created_at: candle.created_at,
                    updated_at: candle.updated_at,
                })),
                format: "JSONEachRow",
            });

            return candles.length;
        } catch (error) {
            throw new Error(
                `Failed to bulk insert candles in ClickHouse: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }
}

const candlesRepo = new CandlesRepository();

export default candlesRepo;
