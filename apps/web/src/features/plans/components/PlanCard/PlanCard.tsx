import { Button } from "../../../../components";
import type { Plan } from "@backtrade/types";
import { formatPrice, getButtonText } from "./utils";
import styles from "./PlanCard.module.css";

interface PlanCardProps {
    plan: Plan;
    isCurrent?: boolean;
    isCreating?: boolean;
    onChangeSubscription: (planId: number, planCode: string) => void;
}

/**
 * Plan card component
 *
 * Displays an available plan that users can subscribe to
 */
export function PlanCard({
    plan,
    isCurrent = false,
    isCreating = false,
    onChangeSubscription,
}: PlanCardProps) {
    const handleSelectPlan = () => {
        onChangeSubscription(plan.id, plan.code);
    };

    return (
        <div className={`${styles.card} ${isCurrent ? styles.current : ""}`}>
            <div className={styles.header}>
                <h3 className={styles.title}>
                    {plan.code.toUpperCase()}
                    {isCurrent && (
                        <span className={styles.currentBadge}>Current</span>
                    )}
                </h3>
            </div>

            <div className={styles.content}>
                <div className={styles.info}>
                    <div className={styles.priceSection}>
                        <span className={styles.price}>
                            {formatPrice(plan.price, plan.currency)}
                        </span>
                        <span className={styles.period}>/month</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.label}>Plan ID:</span>
                        <span className={styles.value}>#{plan.id}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.label}>Currency:</span>
                        <span className={styles.value}>{plan.currency}</span>
                    </div>
                </div>

                <div className={styles.actions}>
                    <Button
                        variant={isCurrent ? "outline" : "primary"}
                        size="medium"
                        onClick={handleSelectPlan}
                        disabled={isCurrent || isCreating}
                    >
                        {isCreating
                            ? "Processing..."
                            : getButtonText(isCurrent)}
                    </Button>
                </div>
            </div>
        </div>
    );
}
