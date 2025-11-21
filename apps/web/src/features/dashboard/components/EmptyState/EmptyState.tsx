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
      <h2 className={styles.title}>No sessions found</h2>
      <p className={styles.message}>Create your first trading session</p>
      <Button variant="primary" size="medium">
        Create Session
      </Button>
    </div>
  );
}
