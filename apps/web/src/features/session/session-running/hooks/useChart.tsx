import { useEffect, useRef } from "react";
import {
  createChart,
  type IChartApi,
  type ISeriesApi,
  CandlestickSeries,
} from "lightweight-charts";
import type { ChartGridSettings } from "../../../../utils/browser/localStorage";
import { createChartConfig } from "../utils/chart";

/**
 * Chart instance and series references
 */
export interface ChartRefs {
  chartRef: React.RefObject<IChartApi | null>;
  seriesRef: React.RefObject<ISeriesApi<"Candlestick"> | null>;
}

/**
 * Hook to initialize and manage chart lifecycle
 *
 * @param containerRef - Reference to the chart container element
 * @param gridSettings - Grid and time scale settings
 * @returns Chart and series references
 */
export function useChart(
  containerRef: React.RefObject<HTMLDivElement | null>,
  gridSettings: ChartGridSettings,
): ChartRefs {
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  // Initialize chart (only once when container is available)
  useEffect(() => {
    if (!containerRef.current) return;

    const config = createChartConfig(
      containerRef.current.clientWidth,
      gridSettings,
    );

    const chart = createChart(containerRef.current, {
      width: config.width,
      height: config.height,
      layout: config.layout,
      grid: config.grid,
      timeScale: config.timeScale,
      rightPriceScale: config.rightPriceScale,
      leftPriceScale: config.leftPriceScale,
    });

    const candlestickSeries = chart.addSeries(
      CandlestickSeries,
      config.candlestickSeries,
    ) as ISeriesApi<"Candlestick">;

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    // Handle resize
    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [containerRef]); // Only initialize once - don't recreate chart when settings change

  // Update chart grid and time scale when settings change
  useEffect(() => {
    if (!chartRef.current) return;

    chartRef.current.applyOptions({
      grid: {
        vertLines: { visible: gridSettings.vertLines },
        horzLines: { visible: gridSettings.horzLines },
      },
      timeScale: {
        timeVisible: gridSettings.timeVisible,
        secondsVisible: gridSettings.secondsVisible,
      },
    });
  }, [gridSettings]);

  return {
    chartRef,
    seriesRef,
  };
}
