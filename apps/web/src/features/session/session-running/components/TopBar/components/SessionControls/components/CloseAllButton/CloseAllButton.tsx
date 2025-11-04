import styles from "./CloseAllButton.module.css";
import { useCloseAllPositions } from "../../../../../../../../../api/requests/positions";
import { useCurrentSessionStore } from "../../../../../../../../../context/CurrentSessionContext";

interface CloseAllButtonProps {
  /**
   * Callback when close all fails
   */
  onError?: (error: string) => void;
  /**
   * Callback when close all succeeds
   */
  onSuccess?: () => void;
}

/**
 * CloseAllButton component
 *
 * Closes all open positions in the session
 */
export function CloseAllButton({ onError, onSuccess }: CloseAllButtonProps) {
  const { currentSession } = useCurrentSessionStore();
  const sessionId = currentSession?.id?.toString();

  const { execute: closeAllPositions, isLoading: isClosing } =
    useCloseAllPositions(sessionId ?? "");

  const handleClick = async () => {
    if (!sessionId) {
      onError?.("Session ID is required");
      return;
    }

    try {
      await closeAllPositions();
      onSuccess?.();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to close all positions";
      onError?.(errorMessage);
    }
  };

  return (
    <button
      className={styles.button}
      onClick={handleClick}
      disabled={!sessionId || isClosing}
    >
      {isClosing ? "Closing..." : "Close all"}
    </button>
  );
}
