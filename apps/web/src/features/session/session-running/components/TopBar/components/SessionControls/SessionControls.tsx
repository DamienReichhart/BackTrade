import styles from "./SessionControls.module.css";
import {
  SpeedSelector,
  PauseResumeButton,
  SkipBarButton,
  CloseAllButton,
  ArchiveButton,
  ControlError,
} from "./components";
import { useControlError } from "./hooks";

/**
 * SessionControls component
 *
 * Orchestrates all session control buttons and error display
 * Composes sub-components for speed selection, pause/resume, and close all operations
 */
export function SessionControls() {
  const { error, handleError, handleSuccess } = useControlError();

  return (
    <div className={styles.controls}>
      <div className={styles.buttons}>
        <SpeedSelector onError={handleError} onSuccess={handleSuccess} />
        <PauseResumeButton onError={handleError} onSuccess={handleSuccess} />
        <SkipBarButton onError={handleError} onSuccess={handleSuccess} />
        <CloseAllButton onError={handleError} onSuccess={handleSuccess} />
        <ArchiveButton onError={handleError} onSuccess={handleSuccess} />
      </div>
      <ControlError error={error} />
    </div>
  );
}
