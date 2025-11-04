import styles from "./TopBar.module.css";
import { SessionMetadata } from "./components/SessionMetadata/SessionMetadata";
import { SessionControls } from "./components/SessionControls/SessionControls";

/**
 * Top bar with session metadata and controls
 * Matches the mockup header area.
 */
export function TopBar() {
  return (
    <div className={styles.topBar}>
      <SessionMetadata />
      <SessionControls />
    </div>
  );
}
