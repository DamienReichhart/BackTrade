import type { Candle } from "@backtrade/types";
import type { LineData, Time } from "lightweight-charts";
import { getCandleValue, toChartTime } from "../utils";
import type { IndicatorSource } from "../types";

/**
 * Calculate Exponential Moving Average (EMA) values
 */
export function calculateEma(
    candles: Candle[],
    period: number,
    source: IndicatorSource
): LineData<Time>[] {
    if (period <= 1 || candles.length < period) {
        return [];
    }

    const multiplier = 2 / (period + 1);
    const result: LineData<Time>[] = [];

    // Seed with SMA of first period
    const seedSlice = candles.slice(0, period);
    const seedSum = seedSlice.reduce(
        (acc, candle) => acc + getCandleValue(candle, source),
        0
    );
    let previousEma = seedSum / period;

    result.push({
        time: toChartTime(seedSlice[seedSlice.length - 1]),
        value: previousEma,
    });

    for (let i = period; i < candles.length; i += 1) {
        const candle = candles[i];
        const value = getCandleValue(candle, source);
        const ema = value * multiplier + previousEma * (1 - multiplier);
        previousEma = ema;
        result.push({
            time: toChartTime(candle),
            value: ema,
        });
    }

    return result;
}
