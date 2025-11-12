import styles from "./PauseResumeButton.module.css";
import { usePauseResume } from "./hooks";

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
  const { canToggle, buttonText, handleClick } = usePauseResume(
    onError,
    onSuccess,
  );

  return (
    <button
      className={styles.button}
      onClick={handleClick}
      disabled={!canToggle}
    >
      {buttonText}
    </button>
  );
}
