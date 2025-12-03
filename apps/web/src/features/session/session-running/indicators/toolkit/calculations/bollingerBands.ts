import type { Candle } from "@backtrade/types";
import type { LineData, Time } from "lightweight-charts";
import { getCandleValue, toChartTime } from "../utils";
import type { IndicatorSource } from "../types";

export interface BollingerBandsData {
    basis: LineData<Time>[];
    upper: LineData<Time>[];
    lower: LineData<Time>[];
}

/**
 * Calculate Bollinger Bands (basis SMA + standard deviation envelopes)
 */
export function calculateBollingerBands(
    candles: Candle[],
    period: number,
    stdDev: number,
    source: IndicatorSource
): BollingerBandsData {
    if (period <= 1 || candles.length < period) {
        return { basis: [], upper: [], lower: [] };
    }

    const values: number[] = [];
    const basis: LineData<Time>[] = [];
    const upper: LineData<Time>[] = [];
    const lower: LineData<Time>[] = [];
    const deviation = Math.max(stdDev, 0.5);

    candles.forEach((candle) => {
        const value = getCandleValue(candle, source);
        values.push(value);

        if (values.length > period) {
            values.shift();
        }

        if (values.length === period) {
            const mean =
                values.reduce((sum, current) => sum + current, 0) / period;
            const variance =
                values.reduce(
                    (sum, current) => sum + (current - mean) ** 2,
                    0
                ) / period;
            const sigma = Math.sqrt(variance) * deviation;
            const time = toChartTime(candle);

            basis.push({ time, value: mean });
            upper.push({ time, value: mean + sigma });
            lower.push({ time, value: mean - sigma });
        }
    });

    return { basis, upper, lower };
}
