import { useModalBehavior } from "../../hooks/useModalBehavior";
import { Button } from "../Button";
import styles from "./ConfirmModal.module.css";

interface ConfirmModalProps {
    /**
     * Whether the modal is open
     */
    isOpen: boolean;

    /**
     * Title of the modal
     */
    title: string;

    /**
     * Message/content to display
     */
    message: string;

    /**
     * Label for the confirm button
     * @default "Confirm"
     */
    confirmLabel?: string;

    /**
     * Label for the cancel button
     * @default "Cancel"
     */
    cancelLabel?: string;

    /**
     * Variant for the confirm button
     * @default "primary"
     */
    confirmVariant?: "primary" | "secondary" | "outline" | "ghost";

    /**
     * Variant for the cancel button
     * @default "outline"
     */
    cancelVariant?: "primary" | "secondary" | "outline" | "ghost";

    /**
     * Whether the confirm action is loading/disabled
     * @default false
     */
    isLoading?: boolean;

    /**
     * Callback when confirm is clicked
     */
    onConfirm: () => void;

    /**
     * Callback when cancel is clicked or modal is closed
     */
    onCancel: () => void;
}

/**
 * Confirm modal component
 *
 * A reusable confirmation dialog modal for user actions
 */
export function ConfirmModal({
    isOpen,
    title,
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    confirmVariant = "primary",
    cancelVariant = "outline",
    isLoading = false,
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    // Handle modal behavior (Escape key, body scroll)
    useModalBehavior(isOpen, onCancel);

    if (!isOpen) return null;

    return (
        <div className={styles.backdrop} onClick={onCancel}>
            <div
                className={styles.modal}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-modal-title"
                aria-describedby="confirm-modal-message"
            >
                <div className={styles.header}>
                    <h2 id="confirm-modal-title" className={styles.title}>
                        {title}
                    </h2>
                    <button
                        className={styles.closeButton}
                        onClick={onCancel}
                        aria-label="Close modal"
                        disabled={isLoading}
                    >
                        ×
                    </button>
                </div>

                <div className={styles.content}>
                    <p id="confirm-modal-message" className={styles.message}>
                        {message}
                    </p>
                </div>

                <div className={styles.footer}>
                    <Button
                        variant={cancelVariant}
                        size="medium"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        variant={confirmVariant}
                        size="medium"
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? "Processing..." : confirmLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
}
