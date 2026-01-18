/**
 * Candle Repository
 *
 * Data access layer for Candle (market data) model operations.
 * Uses ClickHouse for time-series data storage.
 */

import type { Candle, CandleCreateInput } from "@backtrade/types";
import { BaseClickHouseRepository } from "./base-clickhouse-repository";
import { toClickHouseDateTime, toISODateTime } from "../utils/date";

/**
 * Repository for Candle model CRUD operations.
 * Uses ClickHouse for efficient time-series data storage and querying.
 */
class CandlesRepository extends BaseClickHouseRepository {
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

        const clickHouseNow = toClickHouseDateTime(now);

        try {
            await this.clickhouse.insert({
                table: "candles",
                values: [
                    {
                        instrument_id: candleData.instrument_id,
                        timeframe: candleData.timeframe,
                        ts: toClickHouseDateTime(candleData.ts),
                        open: Number(candleData.open),
                        high: Number(candleData.high),
                        low: Number(candleData.low),
                        close: Number(candleData.close),
                        volume: Number(candleData.volume),
                        created_at: candleData.created_at
                            ? toClickHouseDateTime(candleData.created_at)
                            : clickHouseNow,
                        updated_at: candleData.updated_at
                            ? toClickHouseDateTime(candleData.updated_at)
                            : clickHouseNow,
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
     * Groups candles by partition (year-month) to avoid ClickHouse's partition limit
     * (max_partitions_per_insert_block = 100). Inserts each partition group separately.
     *
     * @param data - Array of candle creation data
     * @returns Number of inserted candles
     */
    async createCandles(data: CandleCreateInput[]): Promise<number> {
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

        const clickHouseNow = toClickHouseDateTime(now);

        // Group candles by partition (year-month) to avoid partition limit
        // Partition key is toYYYYMM(ts), which returns YYYYMM as integer
        const partitionGroups = new Map<string, Candle[]>();
        for (const candle of candles) {
            const date = new Date(candle.ts);
            const year = date.getUTCFullYear();
            const month = String(date.getUTCMonth() + 1).padStart(2, "0");
            const partitionKey = `${year}${month}`; // YYYYMM format

            if (!partitionGroups.has(partitionKey)) {
                partitionGroups.set(partitionKey, []);
            }
            partitionGroups.get(partitionKey)!.push(candle);
        }

        // Insert each partition group separately
        let totalInserted = 0;
        try {
            for (const partitionCandles of partitionGroups.values()) {
                await this.clickhouse.insert({
                    table: "candles",
                    values: partitionCandles.map((candle) => ({
                        instrument_id: candle.instrument_id,
                        timeframe: candle.timeframe,
                        ts: toClickHouseDateTime(candle.ts),
                        open: Number(candle.open),
                        high: Number(candle.high),
                        low: Number(candle.low),
                        close: Number(candle.close),
                        volume: Number(candle.volume),
                        created_at: candle.created_at
                            ? toClickHouseDateTime(candle.created_at)
                            : clickHouseNow,
                        updated_at: candle.updated_at
                            ? toClickHouseDateTime(candle.updated_at)
                            : clickHouseNow,
                    })),
                    format: "JSONEachRow",
                });
                totalInserted += partitionCandles.length;
            }

            return totalInserted;
        } catch (error) {
            throw new Error(
                `Failed to bulk insert candles in ClickHouse: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }

    /**
     * Update an existing candle.
     *
     * @param instrument_id - Instrument identifier
     * @param timeframe - Timeframe of the candle
     * @param ts - Timestamp of the candle
     * @param data - Partial candle data to update
     * @returns Updated candle entity
     * @throws Error if candle doesn't exist
     */
    async updateCandle(
        instrument_id: number,
        timeframe: string,
        ts: string,
        data: Partial<Candle>
    ): Promise<Candle> {
        const now = new Date().toISOString();

        // Convert ts to ClickHouse DateTime format
        const clickHouseTs = toClickHouseDateTime(ts);

        // Build SET clause for update
        const setParts: string[] = [];
        const params: Record<string, unknown> = {
            instrument_id,
            timeframe,
            ts: clickHouseTs,
        };

        if (data.open !== undefined) {
            setParts.push("open = {open:Decimal64(8)}");
            params.open = Number(data.open);
        }
        if (data.high !== undefined) {
            setParts.push("high = {high:Decimal64(8)}");
            params.high = Number(data.high);
        }
        if (data.low !== undefined) {
            setParts.push("low = {low:Decimal64(8)}");
            params.low = Number(data.low);
        }
        if (data.close !== undefined) {
            setParts.push("close = {close:Decimal64(8)}");
            params.close = Number(data.close);
        }
        if (data.volume !== undefined) {
            setParts.push("volume = {volume:Float64}");
            params.volume = Number(data.volume);
        }

        // Always update updated_at
        setParts.push("updated_at = {updated_at:DateTime}");
        params.updated_at = toClickHouseDateTime(now);

        if (setParts.length === 0) {
            // No fields to update, just return the existing candle
            const existing = await this.getCandlesByInstrumentAndTimeframe(
                instrument_id,
                timeframe,
                ts,
                ts
            );
            if (existing.length === 0) {
                throw new Error(
                    `Candle not found: instrument_id=${instrument_id}, timeframe=${timeframe}, ts=${ts}`
                );
            }
            return existing[0]!;
        }

        const query = `
            ALTER TABLE candles
            UPDATE ${setParts.join(", ")}
            WHERE instrument_id = {instrument_id:UInt32}
              AND timeframe = {timeframe:String}
              AND ts = {ts:DateTime}
        `.trim();

        try {
            await this.clickhouse.command({
                query,
                query_params: params,
            });

            // Fetch and return the updated candle
            const updated = await this.getCandlesByInstrumentAndTimeframe(
                instrument_id,
                timeframe,
                ts,
                ts
            );
            if (updated.length === 0) {
                throw new Error(
                    `Candle not found after update: instrument_id=${instrument_id}, timeframe=${timeframe}, ts=${ts}`
                );
            }
            return updated[0]!;
        } catch (error) {
            throw new Error(
                `Failed to update candle in ClickHouse: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }

    /**
     * Delete a candle.
     *
     * @param instrument_id - Instrument identifier
     * @param timeframe - Timeframe of the candle
     * @param ts - Timestamp of the candle
     * @throws Error if candle doesn't exist
     */
    async deleteCandle(
        instrument_id: number,
        timeframe: string,
        ts: string
    ): Promise<void> {
        // Convert ts to ClickHouse DateTime format
        const clickHouseTs = toClickHouseDateTime(ts);

        const query = `
            ALTER TABLE candles
            DELETE
            WHERE instrument_id = {instrument_id:UInt32}
              AND timeframe = {timeframe:String}
              AND ts = {ts:DateTime}
        `.trim();

        try {
            await this.clickhouse.command({
                query,
                query_params: {
                    instrument_id,
                    timeframe,
                    ts: clickHouseTs,
                },
            });
        } catch (error) {
            throw new Error(
                `Failed to delete candle from ClickHouse: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }

    /**
     * Get candles by instrument, timeframe, and time range.
     *
     * @param instrument_id - Instrument identifier
     * @param timeframe - Timeframe of the candles
     * @param start - Start timestamp (inclusive)
     * @param end - End timestamp (inclusive)
     * @returns Array of matching candles
     */
    async getCandlesByInstrumentAndTimeframe(
        instrument_id: number,
        timeframe: string,
        start: string,
        end: string
    ): Promise<Candle[]> {
        // Convert start and end to ClickHouse DateTime format
        const clickHouseStart = toClickHouseDateTime(start);
        const clickHouseEnd = toClickHouseDateTime(end);

        // Use FINAL to get deduplicated results from ReplacingMergeTree
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
            FROM candles FINAL
            WHERE instrument_id = {instrument_id:UInt32}
              AND timeframe = {timeframe:String}
              AND ts >= {start:DateTime}
              AND ts <= {end:DateTime}
            ORDER BY ts ASC
        `.trim();

        try {
            const resultSet = await this.clickhouse.query({
                query,
                query_params: {
                    instrument_id,
                    timeframe,
                    start: clickHouseStart,
                    end: clickHouseEnd,
                },
                format: "JSONEachRow",
            });

            const data = (await resultSet.json()) as Candle[];
            return data.map((candle) => {
                const ts = toISODateTime(candle.ts);
                if (ts === null) {
                    throw new Error(
                        `Candle has null timestamp (ts) - data integrity issue: instrument_id=${candle.instrument_id}, timeframe=${candle.timeframe}`
                    );
                }
                return {
                    ...candle,
                    ts,
                    created_at: toISODateTime(candle.created_at) ?? undefined,
                    updated_at: toISODateTime(candle.updated_at) ?? undefined,
                };
            });
        } catch (error) {
            throw new Error(
                `Failed to fetch candles from ClickHouse: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }

    /**
     * Get the last N candles by instrument, timeframe, up to a specific end time.
     *
     * Returns the most recent candles up to the end time, ordered chronologically (oldest first).
     *
     * @param instrument_id - Instrument identifier
     * @param timeframe - Timeframe of the candles
     * @param endTime - End timestamp (inclusive) - candles with ts <= endTime
     * @param limit - Maximum number of candles to return (default: 2000)
     * @returns Array of matching candles, ordered chronologically (oldest first)
     */
    async getLastCandlesByInstrumentAndTimeframe(
        instrument_id: number,
        timeframe: string,
        endTime: string,
        limit: number = 2000
    ): Promise<Candle[]> {
        // Convert endTime to ClickHouse DateTime format (YYYY-MM-DD HH:MM:SS)
        const clickHouseEndTime = toClickHouseDateTime(endTime);

        // Use FINAL to get deduplicated results from ReplacingMergeTree
        // Order by ts DESC to get most recent first, then LIMIT, then reverse for chronological order
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
            FROM candles FINAL
            WHERE instrument_id = {instrument_id:UInt32}
              AND timeframe = {timeframe:String}
              AND ts <= {endTime:DateTime}
            ORDER BY ts DESC
            LIMIT {limit:UInt32}
        `.trim();

        try {
            const resultSet = await this.clickhouse.query({
                query,
                query_params: {
                    instrument_id,
                    timeframe,
                    endTime: clickHouseEndTime,
                    limit,
                },
                format: "JSONEachRow",
            });

            const data = (await resultSet.json()) as Candle[];
            // Reverse to get chronological order (oldest first)
            return data.reverse().map((candle) => {
                const ts = toISODateTime(candle.ts);
                if (ts === null) {
                    throw new Error(
                        `Candle has null timestamp (ts) - data integrity issue: instrument_id=${candle.instrument_id}, timeframe=${candle.timeframe}`
                    );
                }
                return {
                    ...candle,
                    ts,
                    created_at: toISODateTime(candle.created_at) ?? undefined,
                    updated_at: toISODateTime(candle.updated_at) ?? undefined,
                };
            });
        } catch (error) {
            throw new Error(
                `Failed to fetch last candles from ClickHouse: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }

    /**
     * Get the next candle after a specific timestamp for a given instrument and timeframe.
     *
     * Returns the first candle with ts > afterTime, ordered chronologically.
     * Returns null if no candle exists after the specified time.
     *
     * @param instrument_id - Instrument identifier
     * @param timeframe - Timeframe of the candle
     * @param afterTime - Timestamp to search after (exclusive)
     * @returns The next candle or null if none exists
     */
    async getNextCandleByInstrumentAndTimeframe(
        instrument_id: number,
        timeframe: string,
        afterTime: string
    ): Promise<Candle | null> {
        // Convert afterTime to ClickHouse DateTime format
        const clickHouseAfterTime = toClickHouseDateTime(afterTime);

        // Use FINAL to get deduplicated results from ReplacingMergeTree
        // Get the first candle with ts > afterTime, ordered by ts ASC
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
            FROM candles FINAL
            WHERE instrument_id = {instrument_id:UInt32}
              AND timeframe = {timeframe:String}
              AND ts > {afterTime:DateTime}
            ORDER BY ts ASC
            LIMIT 1
        `.trim();

        try {
            const resultSet = await this.clickhouse.query({
                query,
                query_params: {
                    instrument_id,
                    timeframe,
                    afterTime: clickHouseAfterTime,
                },
                format: "JSONEachRow",
            });

            const data = (await resultSet.json()) as Candle[];
            if (data.length === 0) {
                return null;
            }

            const candle = data[0]!;
            const ts = toISODateTime(candle.ts);
            if (ts === null) {
                throw new Error(
                    `Candle has null timestamp (ts) - data integrity issue: instrument_id=${candle.instrument_id}, timeframe=${candle.timeframe}`
                );
            }

            return {
                ...candle,
                ts,
                created_at: toISODateTime(candle.created_at) ?? undefined,
                updated_at: toISODateTime(candle.updated_at) ?? undefined,
            };
        } catch (error) {
            throw new Error(
                `Failed to fetch next candle from ClickHouse: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }
}

const candlesRepo = new CandlesRepository();

export default candlesRepo;
