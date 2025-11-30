import type { Candle } from "@backtrade/types";
import type { LineData, Time } from "lightweight-charts";
import { getCandleValue, toChartTime } from "../utils";
import type { IndicatorSource } from "../types";

/**
 * Calculate Relative Strength Index (RSI) values
 */
export function calculateRsi(
  candles: Candle[],
  period: number,
  source: IndicatorSource,
): LineData<Time>[] {
  if (period <= 1 || candles.length <= period) {
    return [];
  }

  const values = candles.map((candle) => getCandleValue(candle, source));
  const result: LineData<Time>[] = [];

  let gainSum = 0;
  let lossSum = 0;

  for (let i = 1; i <= period; i += 1) {
    const change = values[i] - values[i - 1];
    if (change >= 0) {
      gainSum += change;
    } else {
      lossSum += Math.abs(change);
    }
  }

  let averageGain = gainSum / period;
  let averageLoss = lossSum / period;

  const seedCandle = candles[period];
  result.push({
    time: toChartTime(seedCandle),
    value: calculateRsiValue(averageGain, averageLoss),
  });

  for (let i = period + 1; i < candles.length; i += 1) {
    const change = values[i] - values[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    averageGain = (averageGain * (period - 1) + gain) / period;
    averageLoss = (averageLoss * (period - 1) + loss) / period;

    result.push({
      time: toChartTime(candles[i]),
      value: calculateRsiValue(averageGain, averageLoss),
    });
  }

  return result;
}

function calculateRsiValue(averageGain: number, averageLoss: number): number {
  if (averageLoss === 0) {
    return averageGain === 0 ? 50 : 100;
  }
  if (averageGain === 0) {
    return 0;
  }

  const relativeStrength = averageGain / averageLoss;
  return 100 - 100 / (1 + relativeStrength);
}
