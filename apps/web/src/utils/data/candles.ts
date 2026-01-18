import type { Candle, Timeframe } from "@backtrade/types";
import type { CandlestickData, Time } from "lightweight-charts";
import { timeframeToMilliseconds } from "@backtrade/utils";

/**
 * Convert Candle type to Lightweight Charts candlestick data format
 */
export function convertCandleToChartData(
    candle: Candle
): CandlestickData<Time> {
    // Convert ISO datetime string to Unix timestamp (seconds) as Time
    const time = Math.floor(new Date(candle.ts).getTime() / 1000) as Time;
    return {
        time,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
    };
}

/**
 * Calculate the date range for fetching a specific number of candles
 * based on the timeframe and current timestamp.
 *
 * @param timeframe - The timeframe (e.g., M1, M5, H1, etc.)
 * @param currentTs - The current timestamp (ISO datetime string)
 * @param candleCount - Number of candles to fetch (default: 200)
 * @returns DateRangeQuery with ts_gte and ts_lte
 */
export function calculateCandleDateRange(
    timeframe: Timeframe,
    currentTs: string,
    candleCount: number = 200
): { ts_gte: string; ts_lte: string } {
    const timeframeMs = timeframeToMilliseconds(timeframe);
    const totalMs = timeframeMs * candleCount;
    const currentDate = new Date(currentTs);
    const startDate = new Date(currentDate.getTime() - totalMs);

    // Format as ISO datetime strings (YYYY-MM-DDTHH:mm:ssZ)
    const formatISO = (date: Date): string => {
        return date.toISOString().slice(0, 19) + "Z";
    };

    return {
        ts_gte: formatISO(startDate),
        ts_lte: formatISO(currentDate),
    };
}

/**
 * Calculate the start timestamp of the timeframe period that contains the given timestamp.
 *
 * Candles have timestamps that represent the START of the timeframe period.
 * For example:
 * - M15: periods start at :00, :15, :30, :45 of each hour
 * - M5: periods start at :00, :05, :10, :15, :20, :25, :30, :35, :40, :45, :50, :55
 * - H1: periods start at :00 of each hour
 * - H2: periods start at :00 of even hours (00:00, 02:00, 04:00, etc.)
 * - H4: periods start at :00 of hours divisible by 4 (00:00, 04:00, 08:00, etc.)
 * - D1: periods start at 00:00:00 of each day
 * - W1: periods start at 00:00:00 on Monday of each week
 *
 * @param timeframe - The timeframe (e.g., M1, M5, H1, etc.)
 * @param timestamp - The timestamp (ISO datetime string or Date)
 * @returns The start timestamp of the period (ISO datetime string)
 */
export function calculateTimeframePeriodStart(
    timeframe: Timeframe,
    timestamp: string | Date
): string {
    const date =
        typeof timestamp === "string" ? new Date(timestamp) : timestamp;
    const result = new Date(date);

    // Format as ISO datetime string (YYYY-MM-DDTHH:mm:ssZ)
    const formatISO = (d: Date): string => {
        return d.toISOString().slice(0, 19) + "Z";
    };

    switch (timeframe) {
        case "M1": {
            // Round down to the nearest minute
            result.setSeconds(0, 0);
            return formatISO(result);
        }

        case "M5": {
            // Round down to the nearest 5-minute boundary
            const minutes = result.getMinutes();
            const roundedMinutes = Math.floor(minutes / 5) * 5;
            result.setMinutes(roundedMinutes, 0, 0);
            return formatISO(result);
        }

        case "M10": {
            // Round down to the nearest 10-minute boundary
            const minutes = result.getMinutes();
            const roundedMinutes = Math.floor(minutes / 10) * 10;
            result.setMinutes(roundedMinutes, 0, 0);
            return formatISO(result);
        }

        case "M15": {
            // Round down to the nearest 15-minute boundary
            const minutes = result.getMinutes();
            const roundedMinutes = Math.floor(minutes / 15) * 15;
            result.setMinutes(roundedMinutes, 0, 0);
            return formatISO(result);
        }

        case "M30": {
            // Round down to the nearest 30-minute boundary
            const minutes = result.getMinutes();
            const roundedMinutes = Math.floor(minutes / 30) * 30;
            result.setMinutes(roundedMinutes, 0, 0);
            return formatISO(result);
        }

        case "H1": {
            // Round down to the nearest hour
            result.setMinutes(0, 0, 0);
            return formatISO(result);
        }

        case "H2": {
            // Round down to the nearest 2-hour boundary
            const hours = result.getHours();
            const roundedHours = Math.floor(hours / 2) * 2;
            result.setHours(roundedHours, 0, 0, 0);
            return formatISO(result);
        }

        case "H4": {
            // Round down to the nearest 4-hour boundary
            const hours = result.getHours();
            const roundedHours = Math.floor(hours / 4) * 4;
            result.setHours(roundedHours, 0, 0, 0);
            return formatISO(result);
        }

        case "D1": {
            // Round down to the start of the day (00:00:00)
            result.setHours(0, 0, 0, 0);
            return formatISO(result);
        }

        case "W1": {
            // Round down to the start of the week (Monday 00:00:00)
            const day = result.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
            const daysToMonday = day === 0 ? 6 : day - 1; // Days to subtract to get to Monday
            result.setDate(result.getDate() - daysToMonday);
            result.setHours(0, 0, 0, 0);
            return formatISO(result);
        }

        default: {
            // Fallback: use the timeframe milliseconds to round down
            const timeframeMs = timeframeToMilliseconds(timeframe);
            const timestampMs = date.getTime();
            const roundedMs =
                Math.floor(timestampMs / timeframeMs) * timeframeMs;
            return formatISO(new Date(roundedMs));
        }
    }
}

export function fuse2Candles(candle1: Candle, candle2: Candle): Candle {
    return {
        ts: candle1.ts,
        instrument_id: candle1.instrument_id,
        timeframe: candle1.timeframe,
        volume: candle1.volume + candle2.volume,
        open: candle1.open,
        high: Math.max(candle1.high, candle2.high),
        low: Math.min(candle1.low, candle2.low),
        close: candle2.close,
    };
}
