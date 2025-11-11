import styles from "./PauseResumeButton.module.css";
import {
  usePauseSession,
  useResumeSession,
} from "../../../../../../../../../api/hooks/requests/sessions";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentSessionStore } from "../../../../../../../../../context/CurrentSessionContext";

interface PauseResumeButtonProps {
  /**
   * Callback when pause/resume fails
   */
  onError?: (error: string) => void;
  /**
   * Callback when pause/resume succeeds
   */
  onSuccess?: () => void;
}

/**
 * PauseResumeButton component
 *
 * Toggles session between paused and running states
 */
export function PauseResumeButton({
  onError,
  onSuccess,
}: PauseResumeButtonProps) {
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

  const canToggle = Boolean(
    sessionId && (isSessionRunning || isSessionPaused) && !isLoading,
  );

  const getButtonText = (): string => {
    if (isLoading) {
      return isPausing ? "Pausing..." : "Resuming...";
    }
    return isSessionPaused ? "Resume" : "Pause";
  };

  const handleClick = async () => {
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
  };

  return (
    <button
      className={styles.button}
      onClick={handleClick}
      disabled={!canToggle}
    >
      {getButtonText()}
    </button>
  );
}
