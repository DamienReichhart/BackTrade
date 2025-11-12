import { useState, useEffect, useCallback } from "react";
import {
  getChartGridSettings,
  setChartGridVertLines,
  setChartGridHorzLines,
  setChartTimeVisible,
  setChartSecondsVisible,
  type ChartGridSettings,
} from "../../../../../../../../utils/localStorage";

/**
 * Hook to manage chart grid settings
 *
 * @param onSettingsChange - Callback when settings change
 * @returns Chart settings state and handlers
 */
export function useChartSettings(
  onSettingsChange?: (settings: ChartGridSettings) => void,
) {
  const initialSettings = getChartGridSettings();
  const [vertLines, setVertLines] = useState(initialSettings.vertLines);
  const [horzLines, setHorzLines] = useState(initialSettings.horzLines);
  const [timeVisible, setTimeVisible] = useState(initialSettings.timeVisible);
  const [secondsVisible, setSecondsVisible] = useState(
    initialSettings.secondsVisible,
  );

  // Notify parent of initial settings on mount
  useEffect(() => {
    onSettingsChange?.(initialSettings);
  }, [onSettingsChange, initialSettings]);

  // Handle vertical lines toggle
  const handleVertLinesChange = useCallback(
    (checked: boolean) => {
      setVertLines(checked);
      setChartGridVertLines(checked);
      onSettingsChange?.({
        vertLines: checked,
        horzLines,
        timeVisible,
        secondsVisible,
      });
    },
    [horzLines, timeVisible, secondsVisible, onSettingsChange],
  );

  // Handle horizontal lines toggle
  const handleHorzLinesChange = useCallback(
    (checked: boolean) => {
      setHorzLines(checked);
      setChartGridHorzLines(checked);
      onSettingsChange?.({
        vertLines,
        horzLines: checked,
        timeVisible,
        secondsVisible,
      });
    },
    [vertLines, timeVisible, secondsVisible, onSettingsChange],
  );

  // Handle time visibility toggle
  const handleTimeVisibleChange = useCallback(
    (checked: boolean) => {
      setTimeVisible(checked);
      setChartTimeVisible(checked);
      onSettingsChange?.({
        vertLines,
        horzLines,
        timeVisible: checked,
        secondsVisible,
      });
    },
    [vertLines, horzLines, secondsVisible, onSettingsChange],
  );

  // Handle seconds visibility toggle
  const handleSecondsVisibleChange = useCallback(
    (checked: boolean) => {
      setSecondsVisible(checked);
      setChartSecondsVisible(checked);
      onSettingsChange?.({
        vertLines,
        horzLines,
        timeVisible,
        secondsVisible: checked,
      });
    },
    [vertLines, horzLines, timeVisible, onSettingsChange],
  );

  return {
    vertLines,
    horzLines,
    timeVisible,
    secondsVisible,
    handleVertLinesChange,
    handleHorzLinesChange,
    handleTimeVisibleChange,
    handleSecondsVisibleChange,
  };
}
