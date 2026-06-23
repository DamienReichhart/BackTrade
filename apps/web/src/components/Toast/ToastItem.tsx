import { useEffect } from "react";
import {
    AlertCircle,
    AlertTriangle,
    CheckCircle2,
    Info,
    X,
    type LucideIcon,
} from "lucide-react";
import { type Toast, type ToastType } from "../../store/toast";
import { Icon } from "../Icon";
import styles from "./Toast.module.css";

const TOAST_ICONS: Record<ToastType, LucideIcon> = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
};

interface ToastItemProps {
    toast: Toast;
    onDismiss: (id: string) => void;
}

/**
 * A single toast notification. Auto-dismisses after `toast.duration` ms
 * (unless 0) and can be dismissed manually. Errors/warnings announce
 * assertively; success/info announce politely.
 */
export function ToastItem({ toast, onDismiss }: ToastItemProps) {
    const { id, type, message, duration } = toast;

    useEffect(() => {
        if (duration <= 0) return;
        const timer = setTimeout(() => onDismiss(id), duration);
        return () => clearTimeout(timer);
    }, [id, duration, onDismiss]);

    const isAssertive = type === "error" || type === "warning";

    return (
        <div
            className={`${styles.toast} ${styles[type]}`}
            role={isAssertive ? "alert" : "status"}
        >
            <Icon icon={TOAST_ICONS[type]} size="sm" className={styles.icon} />
            <p className={styles.message}>{message}</p>
            <button
                type="button"
                className={styles.dismiss}
                onClick={() => onDismiss(id)}
                aria-label="Dismiss notification"
            >
                <Icon icon={X} size="sm" />
            </button>
        </div>
    );
}
