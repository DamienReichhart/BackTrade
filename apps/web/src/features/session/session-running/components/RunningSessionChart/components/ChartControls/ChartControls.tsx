import { Toggle, Select } from "../../../../../../../components";
import { type Timeframe, getTimeframeOptions } from "@backtrade/types";
import { useChartSettings } from "./hooks";
import styles from "./ChartControls.module.css";

/**
 * ChartControls component
 *
 * Provides toggle controls for chart grid lines visibility and time scale settings.
 * Also includes a timeframe selector for the chart.
 * Settings are managed by the ChartSettingsStore and persisted in localStorage.
 */
export function ChartControls() {
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
    } = useChartSettings();

    return (
        <div className={styles.controls}>
            <div className={styles.timeframeSection}>
                <label className={styles.label}>Timeframe</label>
                <Select
                    value={timeframe}
                    options={getTimeframeOptions()}
                    onChange={(value) =>
                        handleTimeframeChange(value as Timeframe)
                    }
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
