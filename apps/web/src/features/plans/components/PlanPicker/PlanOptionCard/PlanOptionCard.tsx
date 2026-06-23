import { Badge } from "../../../../../components/Badge";
import { Button } from "../../../../../components/Button";
import { formatMoney } from "../../../utils";
import styles from "./PlanOptionCard.module.css";

interface PlanOptionCardProps {
    displayName: string;
    tagline: string;
    price: number;
    currency: string;
    features: string[];
    recommended: boolean;
    actionLabel: string;
    isCurrent: boolean;
    disabled: boolean;
    onSelect: () => void;
}

/**
 * A single selectable plan in the change-plan grid.
 */
export function PlanOptionCard({
    displayName,
    tagline,
    price,
    currency,
    features,
    recommended,
    actionLabel,
    isCurrent,
    disabled,
    onSelect,
}: PlanOptionCardProps) {
    return (
        <div
            className={`${styles.card} ${isCurrent ? styles.current : ""} ${
                recommended ? styles.recommended : ""
            }`}
        >
            <div className={styles.header}>
                <h3 className={styles.name}>{displayName}</h3>
                {recommended && <Badge variant="accent">Popular</Badge>}
            </div>
            <p className={styles.tagline}>{tagline}</p>

            <div className={styles.priceRow}>
                <span className={styles.price}>
                    {price > 0 ? formatMoney(price, currency) : "Free"}
                </span>
                {price > 0 && <span className={styles.period}>/mo</span>}
            </div>

            <ul className={styles.features}>
                {features.map((feature) => (
                    <li key={feature} className={styles.feature}>
                        {feature}
                    </li>
                ))}
            </ul>

            <div className={styles.action}>
                <Button
                    variant={isCurrent ? "outline" : "primary"}
                    size="medium"
                    fullWidth
                    disabled={disabled || isCurrent}
                    onClick={onSelect}
                >
                    {actionLabel}
                </Button>
            </div>
        </div>
    );
}
