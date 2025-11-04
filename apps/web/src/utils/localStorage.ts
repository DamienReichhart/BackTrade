/**
 * Local Storage Utility Functions
 *
 * Provides type-safe access to localStorage with default values and error handling.
 */

/**
 * Storage keys for chart settings
 */
const STORAGE_KEYS = {
  CHART_GRID_VERT_LINES: "chart.grid.vertLines",
  CHART_GRID_HORZ_LINES: "chart.grid.horzLines",
} as const;

/**
 * Get a value from localStorage, with fallback to default
 *
 * @param key - Storage key
 * @param defaultValue - Default value if key doesn't exist or parsing fails
 * @returns The stored value or default
 */
function getLocalStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") {
    return defaultValue;
  }

  try {
    const item = window.localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.warn(`Failed to parse localStorage item "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Set a value in localStorage
 *
 * @param key - Storage key
 * @param value - Value to store
 */
function setLocalStorageItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Failed to set localStorage item "${key}":`, error);
  }
}

/**
 * Chart grid settings
 */
export interface ChartGridSettings {
  /**
   * Whether vertical grid lines are visible
   */
  vertLines: boolean;

  /**
   * Whether horizontal grid lines are visible
   */
  horzLines: boolean;
}

/**
 * Get chart grid settings from localStorage
 *
 * @returns Chart grid settings with defaults
 */
export function getChartGridSettings(): ChartGridSettings {
  return {
    vertLines: getLocalStorageItem(STORAGE_KEYS.CHART_GRID_VERT_LINES, false),
    horzLines: getLocalStorageItem(STORAGE_KEYS.CHART_GRID_HORZ_LINES, false),
  };
}

/**
 * Set vertical grid lines visibility
 *
 * @param visible - Whether vertical lines should be visible
 */
export function setChartGridVertLines(visible: boolean): void {
  setLocalStorageItem(STORAGE_KEYS.CHART_GRID_VERT_LINES, visible);
}

/**
 * Set horizontal grid lines visibility
 *
 * @param visible - Whether horizontal lines should be visible
 */
export function setChartGridHorzLines(visible: boolean): void {
  setLocalStorageItem(STORAGE_KEYS.CHART_GRID_HORZ_LINES, visible);
}

/**
 * Update chart grid settings
 *
 * @param settings - Partial settings to update
 */
export function updateChartGridSettings(
  settings: Partial<ChartGridSettings>,
): void {
  if (settings.vertLines !== undefined) {
    setChartGridVertLines(settings.vertLines);
  }
  if (settings.horzLines !== undefined) {
    setChartGridHorzLines(settings.horzLines);
  }
}

