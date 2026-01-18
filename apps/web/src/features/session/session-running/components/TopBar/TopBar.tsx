import styles from "./TopBar.module.css";
import { SessionMetadata } from "./components/SessionMetadata/SessionMetadata";

/**
 * Top bar with session metadata and back button
 */
export function TopBar() {
    return (
        <div className={styles.topBar}>
            <SessionMetadata />
        </div>
    );
}
