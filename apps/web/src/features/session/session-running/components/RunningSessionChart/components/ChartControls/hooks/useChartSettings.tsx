import { useCallback } from "react";
import type { Timeframe } from "@backtrade/types";
import { useChartSettingsStore } from "../../../../../../../../context/ChartSettingsContext";

/**
 * Hook to manage chart grid settings
 *
 * @returns Chart settings state and handlers
 */
export function useChartSettings() {
  // Get settings from store
  const vertLines = useChartSettingsStore((state) => state.vertLines);
  const horzLines = useChartSettingsStore((state) => state.horzLines);
  const timeVisible = useChartSettingsStore((state) => state.timeVisible);
  const secondsVisible = useChartSettingsStore((state) => state.secondsVisible);
  const timeframe = useChartSettingsStore((state) => state.timeframe);
  const setVertLines = useChartSettingsStore((state) => state.setVertLines);
  const setHorzLines = useChartSettingsStore((state) => state.setHorzLines);
  const setTimeVisible = useChartSettingsStore((state) => state.setTimeVisible);
  const setSecondsVisible = useChartSettingsStore(
    (state) => state.setSecondsVisible,
  );
  const setTimeframe = useChartSettingsStore((state) => state.setTimeframe);

  // Handle vertical lines toggle
  const handleVertLinesChange = useCallback(
    (checked: boolean) => {
      setVertLines(checked);
    },
    [setVertLines],
  );

  // Handle horizontal lines toggle
  const handleHorzLinesChange = useCallback(
    (checked: boolean) => {
      setHorzLines(checked);
    },
    [setHorzLines],
  );

  // Handle time visibility toggle
  const handleTimeVisibleChange = useCallback(
    (checked: boolean) => {
      setTimeVisible(checked);
    },
    [setTimeVisible],
  );

  // Handle seconds visibility toggle
  const handleSecondsVisibleChange = useCallback(
    (checked: boolean) => {
      setSecondsVisible(checked);
    },
    [setSecondsVisible],
  );

  // Handle timeframe change
  const handleTimeframeChange = useCallback(
    (newTimeframe: Timeframe) => {
      setTimeframe(newTimeframe);
    },
    [setTimeframe],
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
