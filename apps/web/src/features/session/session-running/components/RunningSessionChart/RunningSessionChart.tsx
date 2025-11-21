import { useRef, useMemo } from "react";
import { useCurrentSessionCandlesStore } from "../../../../../store/session";
import { useChartSettingsStore } from "../../../../../store/chart";
import {
  useChart,
  useChartData,
  useChartMarkers,
  useSessionPositions,
  usePositionMarkers,
} from "../../hooks";
import { ChartMenuButton } from "./components/ChartMenuButton";
import {
  IndicatorConfigurator,
  useIndicatorSettingsStore,
} from "../../indicators";
import { useIndicatorEngine } from "../../indicators/hooks";
import styles from "./RunningSessionChart.module.css";

/**
 * RunningSessionChart component
 *
 * Displays a candlestick chart using Lightweight Charts library.
 * The chart data is managed by the CurrentSessionCandlesStore.
 */
export function RunningSessionChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const { candles } = useCurrentSessionCandlesStore();
  const indicators = useIndicatorSettingsStore((state) => state.indicators);

  // Subscribe to individual settings to avoid creating new objects on each render
  const vertLines = useChartSettingsStore((state) => state.vertLines);
  const horzLines = useChartSettingsStore((state) => state.horzLines);
  const timeVisible = useChartSettingsStore((state) => state.timeVisible);
  const secondsVisible = useChartSettingsStore((state) => state.secondsVisible);
  const timeframe = useChartSettingsStore((state) => state.timeframe);

  // Memoize the settings object to prevent unnecessary re-renders
  const gridSettings = useMemo(
    () => ({
      vertLines,
      horzLines,
      timeVisible,
      secondsVisible,
      timeframe,
    }),
    [vertLines, horzLines, timeVisible, secondsVisible, timeframe],
  );

  // Initialize and manage chart lifecycle
  const { chartRef, seriesRef, markersPluginRef, isReady } = useChart(
    chartContainerRef,
    gridSettings,
  );

  // Update chart data when candles change
  useChartData(seriesRef, candles);

  // Build and display entry/exit markers
  const { positions } = useSessionPositions();
  const markers = usePositionMarkers(positions);
  useChartMarkers(markersPluginRef, markers, isReady);

  useIndicatorEngine({
    chartRef,
    candles,
    indicators,
    isReady,
  });

  return (
    <div className={styles.chartContainer}>
      <div className={styles.menuButtonWrapper}>
        <ChartMenuButton />
        <IndicatorConfigurator />
      </div>
      <div ref={chartContainerRef} className={styles.chart} />
    </div>
  );
}
