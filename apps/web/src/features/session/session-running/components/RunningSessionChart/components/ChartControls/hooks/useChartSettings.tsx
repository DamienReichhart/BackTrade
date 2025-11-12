import { useState, useEffect, useCallback, useRef } from "react";
import {
  getChartGridSettings,
  setChartGridVertLines,
  setChartGridHorzLines,
  setChartTimeVisible,
  setChartSecondsVisible,
  setChartTimeframe,
  type ChartGridSettings,
} from "../../../../../../../../utils/localStorage";
import type { Timeframe } from "@backtrade/types";

/**
 * Hook to manage chart grid settings
 *
 * @param onSettingsChange - Callback when settings change
 * @returns Chart settings state and handlers
 */
export function useChartSettings(
  onSettingsChange?: (settings: ChartGridSettings) => void,
) {
  // Initialize state only once using function initializer
  const [vertLines, setVertLines] = useState(
    () => getChartGridSettings().vertLines,
  );
  const [horzLines, setHorzLines] = useState(
    () => getChartGridSettings().horzLines,
  );
  const [timeVisible, setTimeVisible] = useState(
    () => getChartGridSettings().timeVisible,
  );
  const [secondsVisible, setSecondsVisible] = useState(
    () => getChartGridSettings().secondsVisible,
  );
  const [timeframe, setTimeframeState] = useState<Timeframe>(
    () => getChartGridSettings().timeframe,
  );

  // Track if we've notified parent of initial settings
  const hasNotifiedInitial = useRef(false);
  const onSettingsChangeRef = useRef(onSettingsChange);

  // Keep ref in sync with callback
  useEffect(() => {
    onSettingsChangeRef.current = onSettingsChange;
  }, [onSettingsChange]);

  // Notify parent of initial settings once on mount only
  useEffect(() => {
    if (!hasNotifiedInitial.current) {
      const initialSettings = getChartGridSettings();
      onSettingsChangeRef.current?.(initialSettings);
      hasNotifiedInitial.current = true;
    }
  });

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
        timeframe,
      });
    },
    [horzLines, timeVisible, secondsVisible, timeframe, onSettingsChange],
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
        timeframe,
      });
    },
    [vertLines, timeVisible, secondsVisible, timeframe, onSettingsChange],
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
        timeframe,
      });
    },
    [vertLines, horzLines, secondsVisible, timeframe, onSettingsChange],
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
        timeframe,
      });
    },
    [vertLines, horzLines, timeVisible, timeframe, onSettingsChange],
  );

  // Handle timeframe change
  const handleTimeframeChange = useCallback(
    (newTimeframe: Timeframe) => {
      setTimeframeState(newTimeframe);
      setChartTimeframe(newTimeframe);
      onSettingsChange?.({
        vertLines,
        horzLines,
        timeVisible,
        secondsVisible,
        timeframe: newTimeframe,
      });
    },
    [vertLines, horzLines, timeVisible, secondsVisible, onSettingsChange],
  );

  return {
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
  };
}
