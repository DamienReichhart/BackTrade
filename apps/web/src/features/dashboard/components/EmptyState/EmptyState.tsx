import { Button } from "../../../../components/Button";
import styles from "./EmptyState.module.css";

/**
 * Empty state component
 *
 * Displays when no sessions are found
 */
export function EmptyState() {
  return (
    <div className={styles.empty}>
      <div className={styles.icon}>📊</div>
      <h2 className={styles.title}>No sessions yet</h2>
      <p className={styles.message}>
        Get started by creating your first trading session
      </p>
      <Button variant="primary" size="medium">
        Create Session
      </Button>
    </div>
  );
}
