import type { Candle } from "@backtrade/types";
import {
  LineSeries,
  type IChartApi,
  type ISeriesApi,
  type LineSeriesPartialOptions,
} from "lightweight-charts";
import { calculateBollingerBands } from "../calculations";
import type { BollingerBandsIndicatorConfig, IndicatorRuntime } from "../types";

interface SeriesBundle {
  basis: ISeriesApi<"Line">;
  upper: ISeriesApi<"Line">;
  lower: ISeriesApi<"Line">;
}

const DEFAULT_LINE_OPTIONS: Partial<LineSeriesPartialOptions> = {
  priceScaleId: "right",
  lineWidth: 2,
  priceLineVisible: false,
};

/**
 * Runtime for Bollinger Bands (manages three line series)
 */
export function createBollingerRuntime(
  chart: IChartApi,
): IndicatorRuntime<BollingerBandsIndicatorConfig> {
  const basis = chart.addSeries(
    LineSeries,
    DEFAULT_LINE_OPTIONS,
  ) as ISeriesApi<"Line">;
  const upper = chart.addSeries(
    LineSeries,
    DEFAULT_LINE_OPTIONS,
  ) as ISeriesApi<"Line">;
  const lower = chart.addSeries(
    LineSeries,
    DEFAULT_LINE_OPTIONS,
  ) as ISeriesApi<"Line">;

  const series: SeriesBundle = { basis, upper, lower };
  let currentConfig: BollingerBandsIndicatorConfig | null = null;

  return {
    updateConfig(config) {
      currentConfig = config;
      series.basis.applyOptions({
        ...DEFAULT_LINE_OPTIONS,
        lineWidth: config.lineWidth as never,
        color: config.basisColor,
      });
      series.upper.applyOptions({
        ...DEFAULT_LINE_OPTIONS,
        lineWidth: config.lineWidth as never,
        color: config.upperColor,
      });
      series.lower.applyOptions({
        ...DEFAULT_LINE_OPTIONS,
        lineWidth: config.lineWidth as never,
        color: config.lowerColor,
      });
    },
    updateData(candles: Candle[]) {
      if (!currentConfig) {
        return;
      }
      const {
        basis: basisData,
        upper: upperData,
        lower: lowerData,
      } = calculateBollingerBands(
        candles,
        currentConfig.period,
        currentConfig.stdDev,
        currentConfig.source,
      );

      series.basis.setData(basisData);
      series.upper.setData(upperData);
      series.lower.setData(lowerData);
    },
    destroy() {
      try {
        chart.removeSeries(series.basis);
        chart.removeSeries(series.upper);
        chart.removeSeries(series.lower);
      } catch {
        // Chart may already be disposed during cleanup race conditions
      }
    },
  };
}
