import type { Candle } from "@backtrade/types";
import type { CandlestickData, Time } from "lightweight-charts";

/**
 * Convert Candle type to Lightweight Charts candlestick data format
 */
export function convertCandleToChartData(candle: Candle): CandlestickData<Time> {
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