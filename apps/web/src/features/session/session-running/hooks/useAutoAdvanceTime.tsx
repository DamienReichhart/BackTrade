import { useEffect, useRef, useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useUpdateSession } from "../../../../api/hooks/requests/sessions";
import { useCurrentSessionStore } from "../../../../store/session";
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
 * This hook sets up an interval that runs every (1 minute / speed) of real time
 * and advances the session time by 1 minute each interval.
 * For example:
 * - SPEED_1X: advances 1 minute of session time every 1 minute of real time
 * - SPEED_2X: advances 1 minute of session time every 30 seconds of real time
 * - SPEED_15X: advances 1 minute of session time every 4 seconds of real time
 */
export function useAutoAdvanceTime() {
    const { currentSession } = useCurrentSessionStore();
    const sessionId = currentSession?.id?.toString();
    const queryClient = useQueryClient();
    const { execute: updateSession } = useUpdateSession(sessionId ?? "");
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
     * Advance time by 1 minute (60000 ms)
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
            // Calculate new current_time by adding 1 minute (60000 ms)
            const oneMinuteMs = 60 * 1000; // 1 minute in milliseconds
            let newTime = new Date(currentTime.getTime() + oneMinuteMs);

            // Validate against session end_time boundary
            if (currentSession.end_time) {
                const endTs = new Date(currentSession.end_time);
                if (newTime.getTime() > endTs.getTime()) {
                    // Clamp to end_time if new time exceeds session boundary
                    newTime = endTs;
                }
            }

            // Format as ISO datetime string (YYYY-MM-DDTHH:mm:ssZ)
            const newCurrentTs = newTime.toISOString().slice(0, 19) + "Z";

            const updatedSession = await updateSession({
                current_time: newCurrentTs,
            });

            // Update the session query cache with the mutation result
            queryClient.setQueryData(
                ["GET", `/sessions/${sessionId}`],
                updatedSession
            );
        } catch {
            // Silently handle errors to avoid disrupting the interval
            // The interval will continue and retry on the next cycle
        } finally {
            isUpdatingRef.current = false;
        }
    }, [sessionId, currentSession, updateSession, queryClient]);

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
        intervalDuration,
        advanceTime,
    ]);
}
