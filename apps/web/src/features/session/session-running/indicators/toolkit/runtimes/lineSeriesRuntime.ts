import type { Candle } from "@backtrade/types";
import {
  LineSeries,
  type IChartApi,
  type ISeriesApi,
  type LineData,
  type LineSeriesPartialOptions,
  type Time,
} from "lightweight-charts";
import type { IndicatorConfigBase, IndicatorRuntime } from "../types";

interface LineRuntimeConfig<TConfig extends IndicatorConfigBase> {
  getSeriesOptions: (config: TConfig) => Partial<LineSeriesPartialOptions>;
  getData: (candles: Candle[], config: TConfig) => LineData<Time>[];
}

/**
 * Factory for simple line-based indicators (SMA, EMA, etc.)
 */
export function createLineSeriesRuntime<TConfig extends IndicatorConfigBase>(
  chart: IChartApi,
  config: LineRuntimeConfig<TConfig>,
): IndicatorRuntime<TConfig> {
  const series = chart.addSeries(LineSeries, {}) as ISeriesApi<"Line">;
  let currentConfig: TConfig | null = null;

  return {
    updateConfig(nextConfig) {
      currentConfig = nextConfig;
      const options = config.getSeriesOptions(nextConfig);
      series.applyOptions(options);
    },
    updateData(candles) {
      if (!currentConfig) {
        return;
      }
      const data = config.getData(candles, currentConfig);
      series.setData(data);
    },
    destroy() {
      try {
        chart.removeSeries(series);
      } catch {
        // Chart may already be disposed during cleanup race conditions
      }
    },
  };
}
