import { useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  usePauseSession,
  useResumeSession,
} from "../../../../../../../../../../api/hooks/requests/sessions";
import { useCurrentSessionStore } from "../../../../../../../../../../context/CurrentSessionContext";

/**
 * Hook to manage pause/resume session functionality
 *
 * @param onError - Callback when pause/resume fails
 * @param onSuccess - Callback when pause/resume succeeds
 * @returns Pause/resume state and handlers
 */
export function usePauseResume(
  onError?: (error: string) => void,
  onSuccess?: () => void,
) {
  const { currentSession } = useCurrentSessionStore();
  const sessionStatus = currentSession?.session_status;
  const sessionId = currentSession?.id?.toString();

  const queryClient = useQueryClient();
  const { execute: pauseSession, isLoading: isPausing } = usePauseSession(
    sessionId ?? "",
  );
  const { execute: resumeSession, isLoading: isResuming } = useResumeSession(
    sessionId ?? "",
  );

  const isSessionPaused = sessionStatus === "PAUSED";
  const isSessionRunning = sessionStatus === "RUNNING";
  const isLoading = isPausing || isResuming;

  const canToggle = useMemo(
    () => Boolean(sessionId && (isSessionRunning || isSessionPaused) && !isLoading),
    [sessionId, isSessionRunning, isSessionPaused, isLoading],
  );

  const buttonText = useMemo(() => {
    if (isLoading) {
      return isPausing ? "Pausing..." : "Resuming...";
    }
    return isSessionPaused ? "Resume" : "Pause";
  }, [isLoading, isPausing, isSessionPaused]);

  const handleClick = useCallback(async () => {
    if (!sessionId) {
      onError?.("Session ID is required");
      return;
    }

    if (!isSessionPaused && !isSessionRunning) {
      onError?.("Session must be running or paused to toggle");
      return;
    }

    try {
      const updatedSession = isSessionPaused
        ? await resumeSession()
        : await pauseSession();

      // Update the session query cache with the mutation result
      queryClient.setQueryData(
        ["GET", `/sessions/${sessionId}`],
        updatedSession,
      );
      onSuccess?.();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to pause/resume session";
      onError?.(errorMessage);
    }
  }, [
    sessionId,
    isSessionPaused,
    isSessionRunning,
    pauseSession,
    resumeSession,
    queryClient,
    onError,
    onSuccess,
  ]);

  return {
    canToggle,
    buttonText,
    isLoading,
    handleClick,
  };
}

