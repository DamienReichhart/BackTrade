import { useEffect, useRef, useCallback, useMemo } from "react";
import { useSkipSession } from "../../../../api/hooks/requests/sessions";
import {
    useCurrentSessionStore,
    useCurrentSessionCandlesStore,
} from "../../../../store/session";
import { useChartSettingsStore } from "../../../../store/chart";
import {
    fuse2Candles,
    calculateTimeframePeriodStart,
} from "../../../../utils/data/candles";
import { formatDateTime } from "@backtrade/utils";
import { SESSION_STATUS, type Speed } from "@backtrade/types";

/**
 * Convert speed enum to numeric multiplier
 * @param speed - Speed enum value
 * @returns Numeric multiplier (e.g., SPEED_2X -> 2, SPEED_0_5X -> 0.5)
 */
function speedToMultiplier(speed: Speed): number {
    const speedMap: Record<Speed, number> = {
        SPEED_0_5X: 0.5,
        SPEED_1X: 1,
        SPEED_2X: 2,
        SPEED_3X: 3,
        SPEED_5X: 5,
        SPEED_10X: 10,
        SPEED_15X: 15,
    };
    return speedMap[speed] ?? 1;
}

/**
 * Hook to automatically advance session time based on session speed
 * when the session is in RUNNING status.
 *
 * This hook uses the same skip endpoint as the skip bar button, which:
 * - Finds the next candle for the configured timeframe
 * - Advances session time to the next candle timestamp
 * - Processes bar advancement (TP/SL checks, liquidations)
 * - Returns the updated session and the new candle
 * - Appends only the last candle to the chart instead of refetching all candles
 *
 * The hook sets up an interval that runs every (1 minute / speed) of real time
 * and calls the skip endpoint each interval.
 * For example:
 * - SPEED_1X: skips to next candle every 1 minute of real time
 * - SPEED_2X: skips to next candle every 30 seconds of real time
 * - SPEED_15X: skips to next candle every 4 seconds of real time
 */
export function useAutoAdvanceTime() {
    const { currentSession } = useCurrentSessionStore();
    const { appendCandle, getLastCandle, updateLastCandle } =
        useCurrentSessionCandlesStore();
    const timeframe = useChartSettingsStore((state) => state.timeframe);
    const sessionId = currentSession?.id?.toString();
    const { execute: skipSession } = useSkipSession(sessionId ?? "", "M1");
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const isUpdatingRef = useRef(false);

    // Calculate speed multiplier from current session speed
    const speedMultiplier = useMemo(() => {
        const speed = currentSession?.speed ?? "SPEED_1X";
        return speedToMultiplier(speed as Speed);
    }, [currentSession?.speed]);

    // Calculate interval duration: 1 minute (60000ms) divided by speed multiplier
    // This ensures we advance 1 minute of session time at the correct rate
    const intervalDuration = useMemo(() => {
        const oneMinuteMs = 60 * 1000; // 1 minute in milliseconds
        return Math.max(100, Math.floor(oneMinuteMs / speedMultiplier)); // Minimum 100ms to avoid too frequent updates
    }, [speedMultiplier]);

    /**
     * Advance time by skipping to the next candle (same logic as skip bar button)
     * This uses the skip endpoint which:
     * - Finds the next candle for the timeframe
     * - Advances session time
     * - Processes bar advancement (TP/SL checks, liquidations)
     * - Returns the updated session and new candle
     * - Appends only the last candle to the chart
     */
    const advanceTime = useCallback(async () => {
        if (!sessionId) {
            return;
        }

        if (!currentSession?.current_time) {
            return;
        }

        // Don't advance if session is not RUNNING
        if (currentSession.session_status !== SESSION_STATUS.RUNNING) {
            return;
        }

        const currentTime = new Date(currentSession.current_time);
        if (currentSession.end_time) {
            const endTs = new Date(currentSession.end_time);
            if (currentTime.getTime() >= endTs.getTime()) {
                // Stop the interval if we've reached the end time
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }
                return;
            }
        }

        // Prevent overlapping mutations
        if (isUpdatingRef.current) {
            return;
        }
        isUpdatingRef.current = true;

        try {
            // Call the skip endpoint which handles:
            // - Finding the next candle for the timeframe
            // - Advancing session time
            // - Processing bar advancement
            // - Returning the updated session and new candle
            // Note: skipSession mutation requires an empty object as request body
            const result = await skipSession({});

            if (!result) {
                // Skip returned no result, might be at the end
                return;
            }

            // Append the new candle to the store (which will trigger chart update)
            if (
                formatDateTime(
                    calculateTimeframePeriodStart(timeframe, result.candle.ts)
                ) === formatDateTime(result.candle.ts)
            ) {
                appendCandle(result.candle);
            } else {
                const lastCandle = getLastCandle();
                if (lastCandle) {
                    const fusedCandle = fuse2Candles(lastCandle, result.candle);
                    updateLastCandle(fusedCandle);
                }
            }
        } catch {
            // Silently handle errors to avoid disrupting the interval
            // The interval will continue and retry on the next cycle
        } finally {
            isUpdatingRef.current = false;
        }
    }, [sessionId, currentSession, timeframe, skipSession, appendCandle]);

    // Set up interval when session is RUNNING
    useEffect(() => {
        // Clear any existing interval
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        // Only set up interval if session is RUNNING and has valid data
        if (
            currentSession?.session_status === SESSION_STATUS.RUNNING &&
            sessionId &&
            currentSession.current_time
        ) {
            // Set up interval to advance time based on session speed
            // Interval duration = 1 minute / speed multiplier
            intervalRef.current = setInterval(() => {
                advanceTime();
            }, intervalDuration);
        }

        // Cleanup: clear interval on unmount or when dependencies change
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [
        currentSession?.session_status,
        currentSession?.current_time,
        currentSession?.speed,
        sessionId,
        timeframe,
        intervalDuration,
        advanceTime,
    ]);
}
