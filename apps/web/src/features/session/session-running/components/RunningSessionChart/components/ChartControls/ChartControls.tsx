import { useState, useEffect } from "react";
import { Toggle } from "../../../../../../../components";
import {
  getChartGridSettings,
  setChartGridVertLines,
  setChartGridHorzLines,
  setChartTimeVisible,
  setChartSecondsVisible,
  type ChartGridSettings,
} from "../../../../../../../utils/localStorage";
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
  const initialSettings = getChartGridSettings();
  const [vertLines, setVertLines] = useState(initialSettings.vertLines);
  const [horzLines, setHorzLines] = useState(initialSettings.horzLines);
  const [timeVisible, setTimeVisible] = useState(initialSettings.timeVisible);
  const [secondsVisible, setSecondsVisible] = useState(initialSettings.secondsVisible);

  // Notify parent of initial settings on mount
  useEffect(() => {
    onSettingsChange?.(initialSettings);
  }, []);

  // Handle vertical lines toggle
  const handleVertLinesChange = (checked: boolean) => {
    setVertLines(checked);
    setChartGridVertLines(checked);
    onSettingsChange?.({ vertLines: checked, horzLines, timeVisible, secondsVisible });
  };

  // Handle horizontal lines toggle
  const handleHorzLinesChange = (checked: boolean) => {
    setHorzLines(checked);
    setChartGridHorzLines(checked);
    onSettingsChange?.({ vertLines, horzLines: checked, timeVisible, secondsVisible });
  };

  // Handle time visibility toggle
  const handleTimeVisibleChange = (checked: boolean) => {
    setTimeVisible(checked);
    setChartTimeVisible(checked);
    onSettingsChange?.({ vertLines, horzLines, timeVisible: checked, secondsVisible });
  };

  // Handle seconds visibility toggle
  const handleSecondsVisibleChange = (checked: boolean) => {
    setSecondsVisible(checked);
    setChartSecondsVisible(checked);
    onSettingsChange?.({ vertLines, horzLines, timeVisible, secondsVisible: checked });
  };

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

