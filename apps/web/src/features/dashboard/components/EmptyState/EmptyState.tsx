import { Button } from "../../../../components/Button";
import { useDashboardHeader } from "../../hooks";
import styles from "./EmptyState.module.css";

/**
 * Empty state component
 *
 * Displays when no sessions are found
 */
export function EmptyState() {
    const { handleNewSession } = useDashboardHeader();

    return (
        <div className={styles.empty}>
            <h2 className={styles.title}>No sessions found</h2>
            <p className={styles.message}>Create your first trading session</p>
            <Button variant="primary" size="medium" onClick={handleNewSession}>
                Create Session
            </Button>
        </div>
    );
}
