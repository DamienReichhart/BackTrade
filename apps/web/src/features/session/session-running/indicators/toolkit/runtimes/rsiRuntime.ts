import type { Candle } from "@backtrade/types";
import {
  LineSeries,
  LineStyle,
  type IChartApi,
  type IPriceLine,
  type ISeriesApi,
  type LineSeriesPartialOptions,
} from "lightweight-charts";
import { getCSSVar } from "../../../../../../utils";
import { calculateRsi } from "../calculations";
import type { IndicatorRuntime, RsiIndicatorConfig } from "../types";

const SERIES_BASE_OPTIONS: Partial<LineSeriesPartialOptions> = {
  priceScaleId: "left",
  priceLineVisible: false,
  crosshairMarkerVisible: false,
  priceFormat: {
    type: "price",
    minMove: 0.1,
    precision: 1,
  },
} as Partial<LineSeriesPartialOptions>;

/**
 * Runtime implementation for RSI indicator
 */
export function createRsiRuntime(
  chart: IChartApi,
): IndicatorRuntime<RsiIndicatorConfig> {
  const series = chart.addSeries(
    LineSeries,
    SERIES_BASE_OPTIONS,
  ) as ISeriesApi<"Line">;
  const overboughtColor = getCSSVar("--color-warning") || "#f59e0b";
  const oversoldColor = getCSSVar("--color-info") || "#3b82f6";

  let currentConfig: RsiIndicatorConfig | null = null;
  let overboughtLine: IPriceLine | null = null;
  let oversoldLine: IPriceLine | null = null;

  const resetPriceLines = () => {
    if (overboughtLine) {
      series.removePriceLine(overboughtLine);
      overboughtLine = null;
    }
    if (oversoldLine) {
      series.removePriceLine(oversoldLine);
      oversoldLine = null;
    }
  };

  const createZoneLines = (config: RsiIndicatorConfig) => {
    resetPriceLines();
    if (!config.showZones) {
      return;
    }

    overboughtLine = series.createPriceLine({
      price: config.overbought,
      color: overboughtColor,
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      axisLabelVisible: true,
      title: "OB",
    });

    oversoldLine = series.createPriceLine({
      price: config.oversold,
      color: oversoldColor,
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      axisLabelVisible: true,
      title: "OS",
    });
  };

  return {
    updateConfig(config) {
      currentConfig = config;
      series.applyOptions({
        ...SERIES_BASE_OPTIONS,
        color: config.color,
        lineWidth: config.lineWidth as never,
      });
      createZoneLines(config);
    },
    updateData(candles: Candle[]) {
      if (!currentConfig) {
        return;
      }
      const data = calculateRsi(
        candles,
        currentConfig.period,
        currentConfig.source,
      );
      series.setData(data);
    },
    destroy() {
      try {
        resetPriceLines();
        chart.removeSeries(series);
      } catch {
        // Chart may already be disposed during cleanup race conditions
      }
    },
  };
}
