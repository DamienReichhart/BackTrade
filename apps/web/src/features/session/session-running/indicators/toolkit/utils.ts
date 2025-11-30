import type { Candle } from "@backtrade/types";
import type { Time } from "lightweight-charts";
import type { IndicatorSource } from "./types";

/**
 * Map a candle source key to the corresponding numeric value
 */
export function getCandleValue(
  candle: Candle,
  source: IndicatorSource,
): number {
  switch (source) {
    case "open":
      return candle.open;
    case "high":
      return candle.high;
    case "low":
      return candle.low;
    case "close":
    default:
      return candle.close;
  }
}

/**
 * Convert an ISO timestamp to Lightweight Chart time
 */
export function toChartTime(candle: Candle): Time {
  return Math.floor(new Date(candle.ts).getTime() / 1000) as Time;
}
