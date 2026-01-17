import { useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSkipSession } from "../../../../../../../../../../api/hooks/requests/sessions";
import {
    useCurrentSessionStore,
    useCurrentSessionCandlesStore,
} from "../../../../../../../../../../store/session";
import { useChartSettingsStore } from "../../../../../../../../../../store/chart";

/**
 * Hook to manage skip bar functionality
 * Skips the session time forward to the next candle for the specified timeframe
 *
 * This hook uses the new skip endpoint which:
 * - Advances session time to the next candle timestamp
 * - Processes bar advancement (TP/SL checks, liquidations)
 * - Returns the updated session and the new candle
 * - Appends the new candle to the chart instead of refetching all candles
 *
 * @param onError - Callback when skip bar fails
 * @param onSuccess - Callback when skip bar succeeds
 * @returns Skip bar state and handlers
 */
export function useSkipBar(
    onError?: (error: string) => void,
    onSuccess?: () => void
) {
    const { currentSession } = useCurrentSessionStore();
    const { appendCandle } = useCurrentSessionCandlesStore();
    const timeframe = useChartSettingsStore((state) => state.timeframe);
    const sessionId = currentSession?.id?.toString();

    const queryClient = useQueryClient();
    const { execute: skipSession, isLoading } = useSkipSession(
        sessionId ?? "",
        timeframe
    );

    const canSkip = useMemo(
        () => Boolean(sessionId && currentSession?.current_time && !isLoading),
        [sessionId, currentSession, isLoading]
    );

    const handleClick = useCallback(async () => {
        if (!sessionId) {
            onError?.("Session ID is required");
            return;
        }

        if (!currentSession?.current_time) {
            onError?.("Current session time is not available");
            return;
        }

        try {
            // Call the skip endpoint which handles:
            // - Finding the next candle for the timeframe
            // - Advancing session time
            // - Processing bar advancement
            // - Returning the updated session and new candle
            // Note: skipSession mutation requires an empty object as request body
            const result = await skipSession({});

            if (!result) {
                throw new Error("Skip session returned no result");
            }

            // Append the new candle to the store (which will trigger chart update)
            appendCandle(result.candle);

            onSuccess?.();
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Failed to skip bar";
            onError?.(errorMessage);
        }
    }, [
        sessionId,
        currentSession,
        timeframe,
        skipSession,
        queryClient,
        appendCandle,
        onError,
        onSuccess,
    ]);

    return {
        canSkip,
        isLoading,
        handleClick,
    };
}
