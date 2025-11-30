import type { Candle, Timeframe } from "@backtrade/types";
import type { CandlestickData, Time } from "lightweight-charts";
import { timeframeToMilliseconds } from "@backtrade/utils";

/**
 * Convert Candle type to Lightweight Charts candlestick data format
 */
export function convertCandleToChartData(
  candle: Candle,
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
  candleCount: number = 200,
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
