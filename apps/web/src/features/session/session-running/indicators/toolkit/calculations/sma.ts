import type { Candle } from "@backtrade/types";
import type { LineData, Time } from "lightweight-charts";
import { getCandleValue, toChartTime } from "../utils";
import type { IndicatorSource } from "../types";

/**
 * Calculate Simple Moving Average (SMA) values
 */
export function calculateSma(
    candles: Candle[],
    period: number,
    source: IndicatorSource
): LineData<Time>[] {
    if (period <= 0 || candles.length < period) {
        return [];
    }

    const values: number[] = [];
    let sum = 0;
    const result: LineData<Time>[] = [];

    candles.forEach((candle) => {
        const value = getCandleValue(candle, source);
        values.push(value);
        sum += value;

        if (values.length > period) {
            const removed = values.shift();
            if (removed !== undefined) {
                sum -= removed;
            }
        }

        if (values.length === period) {
            result.push({
                time: toChartTime(candle),
                value: sum / period,
            });
        }
    });

    return result;
}
