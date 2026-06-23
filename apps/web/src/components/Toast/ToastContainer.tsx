import { useToastStore } from "../../store/toast";
import { ToastItem } from "./ToastItem";
import styles from "./Toast.module.css";

/**
 * Global toast viewport. Mount once near the app root. Renders the toasts
 * held in the toast store; trigger them with the `useToast` hook.
 */
export function ToastContainer() {
    const toasts = useToastStore((state) => state.toasts);
    const removeToast = useToastStore((state) => state.removeToast);

    if (toasts.length === 0) return null;

    return (
        <div
            className={styles.viewport}
            role="region"
            aria-label="Notifications"
        >
            {toasts.map((toast) => (
                <ToastItem
                    key={toast.id}
                    toast={toast}
                    onDismiss={removeToast}
                />
            ))}
        </div>
    );
}
