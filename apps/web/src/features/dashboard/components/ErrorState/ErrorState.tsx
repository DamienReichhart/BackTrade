import { AlertTriangle } from "lucide-react";
import { Button } from "../../../../components/Button";
import { Icon } from "../../../../components/Icon";
import styles from "./ErrorState.module.css";

interface ErrorStateProps {
    error: Error;
    /** Optional retry handler. Falls back to a full reload when omitted. */
    onRetry?: () => void;
}

/**
 * Error state component
 *
 * Displays an error message when data fetching fails
 */
export function ErrorState({ error, onRetry }: ErrorStateProps) {
    const handleRetry = () => {
        if (onRetry) {
            onRetry();
            return;
        }
        window.location.reload();
    };

    return (
        <div className={styles.error} role="alert">
            <div className={styles.icon}>
                <Icon icon={AlertTriangle} size={48} />
            </div>
            <h2 className={styles.title}>Something went wrong</h2>
            <p className={styles.message}>{error.message}</p>
            <Button variant="primary" size="medium" onClick={handleRetry}>
                Try again
            </Button>
        </div>
    );
}
