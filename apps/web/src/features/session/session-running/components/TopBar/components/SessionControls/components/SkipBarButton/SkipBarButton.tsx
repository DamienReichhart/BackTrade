import styles from "./SkipBarButton.module.css";
import { useSkipBar } from "./hooks";

interface SkipBarButtonProps {
  /**
   * Callback when skip bar fails
   */
  onError?: (error: string) => void;
  /**
   * Callback when skip bar succeeds
   */
  onSuccess?: () => void;
}

/**
 * SkipBarButton component
 *
 * Skips the session time forward by one timeframe
 */
export function SkipBarButton({ onError, onSuccess }: SkipBarButtonProps) {
  const { canSkip, isLoading, handleClick } = useSkipBar(onError, onSuccess);

  return (
    <button className={styles.button} onClick={handleClick} disabled={!canSkip}>
      {isLoading ? "Skipping..." : "Skip Bar"}
    </button>
  );
}
