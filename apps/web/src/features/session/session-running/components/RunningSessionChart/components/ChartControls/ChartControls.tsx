import { Toggle, Select } from "../../../../../../../components";
import type { ChartGridSettings } from "../../../../../../../utils/localStorage";
import type { Timeframe } from "@backtrade/types";
import { useChartSettings } from "./hooks";
import styles from "./ChartControls.module.css";

/**
 * ChartControls component props
 */
interface ChartControlsProps {
  /**
   * Callback when grid settings change
   */
  onSettingsChange?: (settings: ChartGridSettings) => void;
}

/**
 * Timeframe options for the chart
 */
const TIMEFRAME_OPTIONS: Array<{ value: Timeframe; label: string }> = [
  { value: "M1", label: "1 Minute" },
  { value: "M5", label: "5 Minutes" },
  { value: "M10", label: "10 Minutes" },
  { value: "M15", label: "15 Minutes" },
  { value: "M30", label: "30 Minutes" },
  { value: "H1", label: "1 Hour" },
  { value: "H2", label: "2 Hours" },
  { value: "H4", label: "4 Hours" },
  { value: "D1", label: "1 Day" },
  { value: "W1", label: "1 Week" },
];

/**
 * ChartControls component
 *
 * Provides toggle controls for chart grid lines visibility and time scale settings.
 * Also includes a timeframe selector for the chart.
 * Settings are persisted in localStorage.
 */
export function ChartControls({ onSettingsChange }: ChartControlsProps) {
  const {
    vertLines,
    horzLines,
    timeVisible,
    secondsVisible,
    timeframe,
    handleVertLinesChange,
    handleHorzLinesChange,
    handleTimeVisibleChange,
    handleSecondsVisibleChange,
    handleTimeframeChange,
  } = useChartSettings(onSettingsChange);

  return (
    <div className={styles.controls}>
      <div className={styles.timeframeSection}>
        <label className={styles.label}>Timeframe</label>
        <Select
          value={timeframe}
          options={TIMEFRAME_OPTIONS}
          onChange={(value) => handleTimeframeChange(value as Timeframe)}
        />
      </div>
      <Toggle
        label="Vertical Lines"
        checked={vertLines}
        onChange={handleVertLinesChange}
      />
      <Toggle
        label="Horizontal Lines"
        checked={horzLines}
        onChange={handleHorzLinesChange}
      />
      <Toggle
        label="Show Time"
        checked={timeVisible}
        onChange={handleTimeVisibleChange}
      />
      <Toggle
        label="Show Seconds"
        checked={secondsVisible}
        onChange={handleSecondsVisibleChange}
      />
    </div>
  );
}
