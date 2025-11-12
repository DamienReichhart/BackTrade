import { Toggle } from "../../../../../../../components";
import type { ChartGridSettings } from "../../../../../../../utils/localStorage";
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
 * ChartControls component
 *
 * Provides toggle controls for chart grid lines visibility and time scale settings.
 * Settings are persisted in localStorage.
 */
export function ChartControls({ onSettingsChange }: ChartControlsProps) {
  const {
    vertLines,
    horzLines,
    timeVisible,
    secondsVisible,
    handleVertLinesChange,
    handleHorzLinesChange,
    handleTimeVisibleChange,
    handleSecondsVisibleChange,
  } = useChartSettings(onSettingsChange);

  return (
    <div className={styles.controls}>
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
