import { useRef, useState } from "react";
import { useCurrentSessionCandlesStore } from "../../../../../context/CurrentSessionCandlesContext";
import {
  getChartGridSettings,
  type ChartGridSettings,
} from "../../../../../utils/localStorage";
import { useChart, useChartData } from "../../hooks";
import { ChartMenuButton } from "./components/ChartMenuButton";
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
  const [gridSettings, setGridSettings] = useState<ChartGridSettings>(() =>
    getChartGridSettings(),
  );

  // Initialize and manage chart lifecycle
  const { seriesRef } = useChart(chartContainerRef, gridSettings);

  // Update chart data when candles change
  useChartData(seriesRef, candles);

  // Handle grid settings change from ChartControls
  const handleGridSettingsChange = (settings: ChartGridSettings) => {
    setGridSettings(settings);
  };

  return (
    <div className={styles.chartContainer}>
      <div className={styles.menuButtonWrapper}>
        <ChartMenuButton onSettingsChange={handleGridSettingsChange} />
      </div>
      <div ref={chartContainerRef} className={styles.chart} />
    </div>
  );
}
