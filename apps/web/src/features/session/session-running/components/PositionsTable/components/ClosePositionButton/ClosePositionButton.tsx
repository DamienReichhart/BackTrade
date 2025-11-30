import styles from "./ClosePositionButton.module.css";
import { useClosePosition } from "./hooks";

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
  const { isClosing, handleClose } = useClosePosition(
    positionId,
    onError,
    onSuccess,
  );

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
