import { useQueryClient } from "@tanstack/react-query";
import { useClosePosition } from "../../../../../../../api/requests/positions";
import { useCurrentSessionStore } from "../../../../../../../context/CurrentSessionContext";
import styles from "./ClosePositionButton.module.css";

interface ClosePositionButtonProps {
  /**
   * Position ID to close
   */
  positionId: number;
  /**
   * Callback when close position fails
   */
  onError?: (error: string) => void;
  /**
   * Callback when close position succeeds
   */
  onSuccess?: () => void;
}

/**
 * ClosePositionButton component
 *
 * Closes a single position and refreshes the positions list
 */
export function ClosePositionButton({
  positionId,
  onError,
  onSuccess,
}: ClosePositionButtonProps) {
  const { currentSession } = useCurrentSessionStore();
  const sessionId = currentSession?.id?.toString();

  const queryClient = useQueryClient();
  const { execute: closePosition, isLoading: isClosing } = useClosePosition(
    String(positionId),
  );

  const handleClose = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (!sessionId) {
      onError?.("Session ID is required");
      return;
    }

    try {
      await closePosition();

      // Invalidate queries to refresh positions and transactions
      queryClient.invalidateQueries({
        queryKey: ["GET", `/sessions/${sessionId}/positions`],
      });
      queryClient.invalidateQueries({
        queryKey: ["GET", `/sessions/${sessionId}/transactions`],
      });
      queryClient.invalidateQueries({
        queryKey: ["GET", `/sessions/${sessionId}`],
      });

      onSuccess?.();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to close position";
      onError?.(errorMessage);
    }
  };

  return (
    <button
      type="button"
      className={styles.button}
      onClick={handleClose}
      disabled={isClosing}
      title="Close position"
    >
      {isClosing ? "Closing..." : "Close"}
    </button>
  );
}
