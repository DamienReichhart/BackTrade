import { useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Speed } from "@backtrade/types";
import { useUpdateSession } from "../../../../../../../../../../api/hooks/requests/sessions";
import { useCurrentSessionStore } from "../../../../../../../../../../context/CurrentSessionContext";

/**
 * Available speed options
 */
const AVAILABLE_SPEEDS: Speed[] = [
  "0.5x",
  "1x",
  "2x",
  "3x",
  "5x",
  "10x",
  "15x",
];

/**
 * Hook to manage speed selector functionality
 *
 * @param onError - Callback when speed update fails
 * @param onSuccess - Callback when speed update succeeds
 * @returns Speed selector state and handlers
 */
export function useSpeedSelector(
  onError?: (error: string) => void,
  onSuccess?: () => void,
) {
  const { currentSession } = useCurrentSessionStore();
  const currentSpeed = currentSession?.speed ?? "1x";
  const sessionId = currentSession?.id?.toString();

  const queryClient = useQueryClient();
  const { execute: updateSession, isLoading: isUpdatingSpeed } =
    useUpdateSession(sessionId ?? "");

  const speedOptions = useMemo(
    () =>
      AVAILABLE_SPEEDS.map((speed) => ({
        value: speed,
        label: speed,
      })),
    [],
  );

  const handleSpeedSelect = useCallback(
    async (speed: string) => {
      if (!sessionId) {
        onError?.("Session ID is required");
        return;
      }

      const speedValue = speed as Speed;

      if (speedValue === currentSpeed) {
        return;
      }

      try {
        const updatedSession = await updateSession({ speed: speedValue });

        // Update the session query cache with the mutation result
        queryClient.setQueryData(
          ["GET", `/sessions/${sessionId}`],
          updatedSession,
        );
        onSuccess?.();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update session speed";
        onError?.(errorMessage);
      }
    },
    [sessionId, currentSpeed, updateSession, queryClient, onError, onSuccess],
  );

  return {
    currentSpeed,
    speedOptions,
    isUpdatingSpeed,
    isDisabled: !sessionId || isUpdatingSpeed,
    handleSpeedSelect,
  };
}
