import styles from "./SessionControls.module.css";
import { useState } from "react";
import {
  SpeedSelector,
  PauseResumeButton,
  CloseAllButton,
  ControlError,
} from "./components";

/**
 * SessionControls component
 *
 * Orchestrates all session control buttons and error display
 * Composes sub-components for speed selection, pause/resume, and close all operations
 */
export function SessionControls() {
  const [error, setError] = useState<string | null>(null);

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleSuccess = () => {
    setError(null);
  };

  return (
    <div className={styles.controls}>
      <div className={styles.buttons}>
        <SpeedSelector onError={handleError} onSuccess={handleSuccess} />
        <PauseResumeButton onError={handleError} onSuccess={handleSuccess} />
        <CloseAllButton onError={handleError} onSuccess={handleSuccess} />
      </div>
      <ControlError error={error} />
    </div>
  );
}
