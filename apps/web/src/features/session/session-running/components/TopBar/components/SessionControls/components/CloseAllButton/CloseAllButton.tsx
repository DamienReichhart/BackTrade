import styles from "./CloseAllButton.module.css";
import { useCloseAll } from "./hooks";

interface CloseAllButtonProps {
    /**
     * Callback when close all fails
     */
    onError?: (error: string) => void;
    /**
     * Callback when close all succeeds
     */
    onSuccess?: () => void;
}

/**
 * CloseAllButton component
 *
 * Closes all open positions in the session
 */
export function CloseAllButton({ onError, onSuccess }: CloseAllButtonProps) {
    const { isDisabled, buttonText, handleClick } = useCloseAll(
        onError,
        onSuccess
    );

    return (
        <button
            className={styles.button}
            onClick={handleClick}
            disabled={isDisabled}
        >
            {buttonText}
        </button>
    );
}
