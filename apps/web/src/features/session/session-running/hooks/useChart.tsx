import { useEffect, useRef, useState } from "react";
import {
  createChart,
  type IChartApi,
  type ISeriesApi,
  CandlestickSeries,
  createSeriesMarkers,
  type ISeriesMarkersPluginApi,
  type Time,
} from "lightweight-charts";
import type { ChartGridSettings } from "../../../../utils/browser/localStorage";
import { createChartConfig } from "../utils/chart";

/**
 * Chart instance and series references
 */
export interface ChartRefs {
  chartRef: React.RefObject<IChartApi | null>;
  seriesRef: React.RefObject<ISeriesApi<"Candlestick"> | null>;
  markersPluginRef: React.RefObject<ISeriesMarkersPluginApi<Time> | null>;
  isReady: boolean;
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
  const markersPluginRef = useRef<ISeriesMarkersPluginApi<Time> | null>(null);
  const [isReady, setIsReady] = useState(false);

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

    const markersPlugin = createSeriesMarkers(candlestickSeries);

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;
    markersPluginRef.current = markersPlugin;

    // Defer state update to avoid cascading renders
    queueMicrotask(() => setIsReady(true));

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
      markersPluginRef.current?.detach();
      markersPluginRef.current = null;
      seriesRef.current = null;
      chartRef.current = null;
      setIsReady(false);
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
    markersPluginRef,
    isReady,
  };
}
