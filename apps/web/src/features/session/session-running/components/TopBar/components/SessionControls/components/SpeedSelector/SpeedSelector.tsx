import styles from "./SpeedSelector.module.css";
import { Select } from "../../../../../../../../../components/Select";
import { useSpeedSelector } from "./hooks";

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
  const {
    currentSpeed,
    speedOptions,
    isUpdatingSpeed,
    isDisabled,
    handleSpeedSelect,
  } = useSpeedSelector(onError, onSuccess);

  return (
    <div className={styles.speedSelector}>
      <Select
        value={currentSpeed}
        onChange={handleSpeedSelect}
        options={speedOptions}
        placeholder="Select speed"
        disabled={isDisabled}
        className={styles.select}
      />
      {isUpdatingSpeed && <span className={styles.updating}>Updating...</span>}
    </div>
  );
}
