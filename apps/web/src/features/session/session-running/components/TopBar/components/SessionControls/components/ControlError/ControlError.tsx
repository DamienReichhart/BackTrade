import styles from "./ControlError.module.css";

interface ControlErrorProps {
    /**
     * Error message to display
     */
    error?: string | null;
}

/**
 * ControlError component
 *
 * Displays error messages for session control operations
 */
export function ControlError({ error }: ControlErrorProps) {
    if (!error) {
        return null;
    }

    return <div className={styles.error}>{error}</div>;
}
