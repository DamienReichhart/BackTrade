import { useState, useEffect } from "react";
import { Toggle } from "../../../../../../../components";
import {
  getChartGridSettings,
  setChartGridVertLines,
  setChartGridHorzLines,
} from "../../../../../../../utils/localStorage";
import styles from "./ChartControls.module.css";

/**
 * ChartControls component props
 */
interface ChartControlsProps {
  /**
   * Callback when grid settings change
   */
  onSettingsChange?: (settings: { vertLines: boolean; horzLines: boolean }) => void;
}

/**
 * ChartControls component
 *
 * Provides toggle controls for chart grid lines visibility.
 * Settings are persisted in localStorage.
 */
export function ChartControls({ onSettingsChange }: ChartControlsProps) {
  const initialSettings = getChartGridSettings();
  const [vertLines, setVertLines] = useState(initialSettings.vertLines);
  const [horzLines, setHorzLines] = useState(initialSettings.horzLines);

  // Notify parent of initial settings on mount
  useEffect(() => {
    onSettingsChange?.(initialSettings);
  }, []);

  // Handle vertical lines toggle
  const handleVertLinesChange = (checked: boolean) => {
    setVertLines(checked);
    setChartGridVertLines(checked);
    onSettingsChange?.({ vertLines: checked, horzLines });
  };

  // Handle horizontal lines toggle
  const handleHorzLinesChange = (checked: boolean) => {
    setHorzLines(checked);
    setChartGridHorzLines(checked);
    onSettingsChange?.({ vertLines, horzLines: checked });
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
    </div>
  );
}

