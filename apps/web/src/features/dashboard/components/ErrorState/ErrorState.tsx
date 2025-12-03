import { Button } from "../../../../components/Button";
import styles from "./ErrorState.module.css";

interface ErrorStateProps {
    error: Error;
}

/**
 * Error state component
 *
 * Displays an error message when data fetching fails
 */
export function ErrorState({ error }: ErrorStateProps) {
    const handleRetry = () => {
        window.location.reload();
    };

    return (
        <div className={styles.error}>
            <div className={styles.icon}>⚠️</div>
            <h2 className={styles.title}>Something went wrong</h2>
            <p className={styles.message}>{error.message}</p>
            <Button variant="primary" size="medium" onClick={handleRetry}>
                Try again
            </Button>
        </div>
    );
}
