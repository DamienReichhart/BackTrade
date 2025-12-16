import styles from "./DetailItem.module.css";

/**
 * Detail item component for displaying a label-value pair
 */
export function DetailItem({
    label,
    value,
    variant,
}: {
    label: string;
    value: React.ReactNode;
    variant?: "default" | "code" | "badge";
}) {
    return (
        <div className={styles.detailItem}>
            <span className={styles.detailLabel}>{label}</span>
            <span
                className={`${styles.detailValue} ${variant ? styles[variant] : ""}`}
            >
                {value}
            </span>
        </div>
    );
}
