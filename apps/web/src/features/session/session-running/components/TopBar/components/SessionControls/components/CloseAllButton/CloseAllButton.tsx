import { useState } from "react";
import { ConfirmModal } from "../../../../../../../../../components/ConfirmModal";
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
 * Closes all open positions in the session, behind a confirmation dialog
 * since the action realizes P&L on every open position and cannot be undone.
 */
export function CloseAllButton({ onError, onSuccess }: CloseAllButtonProps) {
    const { isClosing, isDisabled, buttonText, handleClick } = useCloseAll(
        onError,
        onSuccess
    );
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const handleConfirm = async () => {
        await handleClick();
        setIsConfirmOpen(false);
    };

    return (
        <>
            <button
                className={styles.button}
                onClick={() => setIsConfirmOpen(true)}
                disabled={isDisabled}
            >
                {buttonText}
            </button>
            <ConfirmModal
                isOpen={isConfirmOpen}
                title="Close all positions?"
                message="This immediately closes every open position at the current market price and realizes their profit or loss. This cannot be undone."
                confirmLabel="Close all"
                cancelLabel="Cancel"
                isLoading={isClosing}
                onConfirm={handleConfirm}
                onCancel={() => setIsConfirmOpen(false)}
            />
        </>
    );
}
