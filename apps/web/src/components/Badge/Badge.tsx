import { type ReactNode } from "react";
import styles from "./Badge.module.css";

export type BadgeVariant =
    | "neutral"
    | "success"
    | "danger"
    | "warning"
    | "info"
    | "accent";

interface BadgeProps {
    children: ReactNode;
    /** Semantic color. @default "neutral" */
    variant?: BadgeVariant;
    className?: string;
}

/**
 * Badge
 *
 * Small pill for statuses, roles, and counts. Uses semantic color tokens so
 * meaning stays consistent across the app.
 */
export function Badge({
    children,
    variant = "neutral",
    className,
}: BadgeProps) {
    return (
        <span
            className={`${styles.badge} ${styles[variant]} ${className ?? ""}`}
        >
            {children}
        </span>
    );
}
