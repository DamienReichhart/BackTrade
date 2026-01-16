import type { StatCardVariant, ValueColor } from "@backtrade/types";
import styles from "./StatCard.module.css";

/**
 * StatCard props interface
 */
interface StatCardProps {
    /**
     * Label text displayed above the value
     */
    label: string;

    /**
     * Main value to display
     */
    value: string | number;

    /**
     * Optional subtext displayed below the value
     */
    subtext?: string;

    /**
     * Card variant
     * @default "default"
     */
    variant?: StatCardVariant;

    /**
     * Value color based on sentiment
     * @default "default"
     */
    valueColor?: ValueColor;

    /**
     * Additional CSS class
     */
    className?: string;
}

/**
 * StatCard component for displaying key metrics
 *
 * Displays a labeled statistic with optional subtext and color coding
 *
 * @example
 * ```tsx
 * <StatCard label="Net PnL" value="+€13,118.64" valueColor="positive" />
 * <StatCard label="Max Drawdown" value="-8.6%" valueColor="negative" />
 * ```
 */
export function StatCard({
    label,
    value,
    subtext,
    variant = "default",
    valueColor = "default",
    className,
}: StatCardProps) {
    const cardClasses = [styles.card, styles[variant], className]
        .filter(Boolean)
        .join(" ");

    const valueClasses = [
        styles.value,
        valueColor !== "default" && styles[valueColor],
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={cardClasses}>
            <span className={styles.label}>{label}</span>
            <span className={valueClasses}>{value}</span>
            {subtext && <span className={styles.subtext}>{subtext}</span>}
        </div>
    );
}
