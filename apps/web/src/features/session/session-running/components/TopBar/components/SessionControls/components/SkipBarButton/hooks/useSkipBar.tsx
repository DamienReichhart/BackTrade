import { useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useUpdateSession } from "../../../../../../../../../../api/hooks/requests/sessions";
import { useCurrentSessionStore } from "../../../../../../../../../../store/session";
import { useChartSettingsStore } from "../../../../../../../../../../store/chart";
import { timeframeToMilliseconds } from "@backtrade/utils";

/**
 * Hook to manage skip bar functionality
 * Skips the session time forward by one timeframe
 *
 * @param onError - Callback when skip bar fails
 * @param onSuccess - Callback when skip bar succeeds
 * @returns Skip bar state and handlers
 */
export function useSkipBar(
  onError?: (error: string) => void,
  onSuccess?: () => void,
) {
  const { currentSession } = useCurrentSessionStore();
  const timeframe = useChartSettingsStore((state) => state.timeframe);
  const sessionId = currentSession?.id?.toString();

  const queryClient = useQueryClient();
  const { execute: updateSession, isLoading } = useUpdateSession(
    sessionId ?? "",
  );

  const canSkip = useMemo(
    () => Boolean(sessionId && currentSession?.current_ts && !isLoading),
    [sessionId, currentSession, isLoading],
  );

  const handleClick = useCallback(async () => {
    if (!sessionId) {
      onError?.("Session ID is required");
      return;
    }

    if (!currentSession?.current_ts) {
      onError?.("Current session time is not available");
      return;
    }

    try {
      // Calculate new current_ts by adding timeframe duration
      const currentTime = new Date(currentSession.current_ts);
      const timeframeMs = timeframeToMilliseconds(timeframe);
      let newTime = new Date(currentTime.getTime() + timeframeMs);

      // Validate against session end_ts boundary
      if (currentSession.end_ts) {
        const endTs = new Date(currentSession.end_ts);
        if (newTime.getTime() > endTs.getTime()) {
          // Clamp to end_ts if new time exceeds session boundary
          newTime = endTs;
        }
      }

      // Format as ISO datetime string (YYYY-MM-DDTHH:mm:ssZ)
      const newCurrentTs = newTime.toISOString().slice(0, 19) + "Z";

      const updatedSession = await updateSession({
        current_ts: newCurrentTs,
      });

      // Update the session query cache with the mutation result
      queryClient.setQueryData(
        ["GET", `/sessions/${sessionId}`],
        updatedSession,
      );
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
    updateSession,
    queryClient,
    onError,
    onSuccess,
  ]);

  return {
    canSkip,
    isLoading,
    handleClick,
  };
}
