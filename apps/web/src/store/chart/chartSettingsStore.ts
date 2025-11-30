import { create } from "zustand";
import type { Timeframe } from "@backtrade/types";
import {
  type ChartGridSettings,
  getChartGridSettings,
  setChartGridVertLines,
  setChartGridHorzLines,
  setChartTimeVisible,
  setChartSecondsVisible,
  setChartTimeframe,
} from "../../utils/browser/localStorage";

interface ChartSettingsState {
  vertLines: boolean;
  horzLines: boolean;
  timeVisible: boolean;
  secondsVisible: boolean;
  timeframe: Timeframe;
  setVertLines: (visible: boolean) => void;
  setHorzLines: (visible: boolean) => void;
  setTimeVisible: (visible: boolean) => void;
  setSecondsVisible: (visible: boolean) => void;
  setTimeframe: (timeframe: Timeframe) => void;
  updateSettings: (settings: Partial<ChartGridSettings>) => void;
  getSettings: () => ChartGridSettings;
}

/**
 * Zustand store for managing chart grid settings globally.
 * Settings are persisted to localStorage and initialized from localStorage on store creation.
 * This store allows components throughout the application to access
 * and update chart settings without prop drilling.
 */
export const useChartSettingsStore = create<ChartSettingsState>((set, get) => {
  // Initialize from localStorage
  const initialSettings = getChartGridSettings();

  return {
    // Initial state from localStorage
    vertLines: initialSettings.vertLines,
    horzLines: initialSettings.horzLines,
    timeVisible: initialSettings.timeVisible,
    secondsVisible: initialSettings.secondsVisible,
    timeframe: initialSettings.timeframe,

    // Actions
    setVertLines: (visible) => {
      set({ vertLines: visible });
      setChartGridVertLines(visible);
    },

    setHorzLines: (visible) => {
      set({ horzLines: visible });
      setChartGridHorzLines(visible);
    },

    setTimeVisible: (visible) => {
      set({ timeVisible: visible });
      setChartTimeVisible(visible);
    },

    setSecondsVisible: (visible) => {
      set({ secondsVisible: visible });
      setChartSecondsVisible(visible);
    },

    setTimeframe: (timeframe) => {
      set({ timeframe });
      setChartTimeframe(timeframe);
    },

    updateSettings: (settings) => {
      const current = get();
      const updated = { ...current, ...settings };
      set(updated);

      // Persist to localStorage
      if (settings.vertLines !== undefined) {
        setChartGridVertLines(settings.vertLines);
      }
      if (settings.horzLines !== undefined) {
        setChartGridHorzLines(settings.horzLines);
      }
      if (settings.timeVisible !== undefined) {
        setChartTimeVisible(settings.timeVisible);
      }
      if (settings.secondsVisible !== undefined) {
        setChartSecondsVisible(settings.secondsVisible);
      }
      if (settings.timeframe !== undefined) {
        setChartTimeframe(settings.timeframe);
      }
    },

    getSettings: () => {
      const state = get();
      return {
        vertLines: state.vertLines,
        horzLines: state.horzLines,
        timeVisible: state.timeVisible,
        secondsVisible: state.secondsVisible,
        timeframe: state.timeframe,
      };
    },
  };
});
