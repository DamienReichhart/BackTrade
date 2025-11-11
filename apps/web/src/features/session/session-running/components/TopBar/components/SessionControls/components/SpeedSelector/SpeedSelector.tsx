import styles from "./SpeedSelector.module.css";
import type { Speed } from "@backtrade/types";
import { useUpdateSession } from "../../../../../../../../../api/requests/sessions";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentSessionStore } from "../../../../../../../../../context/CurrentSessionContext";
import { Select } from "../../../../../../../../../components/Select";

interface SpeedSelectorProps {
  /**
   * Callback when speed update fails
   */
  onError?: (error: string) => void;
  /**
   * Callback when speed update succeeds
   */
  onSuccess?: () => void;
}

/**
 * SpeedSelector component
 *
 * Displays a dropdown menu for selecting session playback speed
 */
export function SpeedSelector({ onError, onSuccess }: SpeedSelectorProps) {
  const { currentSession } = useCurrentSessionStore();
  const currentSpeed = currentSession?.speed ?? "1x";
  const sessionId = currentSession?.id?.toString();

  const queryClient = useQueryClient();
  const { execute: updateSession, isLoading: isUpdatingSpeed } =
    useUpdateSession(sessionId ?? "");

  const availableSpeeds: Speed[] = [
    "0.5x",
    "1x",
    "2x",
    "3x",
    "5x",
    "10x",
    "15x",
  ];

  const speedOptions = availableSpeeds.map((speed) => ({
    value: speed,
    label: speed,
  }));

  const handleSpeedSelect = async (speed: string) => {
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
  };

  return (
    <div className={styles.speedSelector}>
      <Select
        value={currentSpeed}
        onChange={handleSpeedSelect}
        options={speedOptions}
        placeholder="Select speed"
        disabled={!sessionId || isUpdatingSpeed}
        className={styles.select}
      />
      {isUpdatingSpeed && <span className={styles.updating}>Updating...</span>}
    </div>
  );
}
