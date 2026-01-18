import type { Subscription, Plan } from "@backtrade/types";
import { PlanCard } from "../PlanCard/PlanCard";
import { isCurrentPlan } from "./utils";
import styles from "./PlansList.module.css";

interface PlansListProps {
    plans: Plan[];
    currentSubscription: Subscription | undefined;
    isCreating?: boolean;
    onChangeSubscription: (
        planId: number,
        planCode: string,
        plan: Plan
    ) => void;
}

/**
 * Plans list component
 *
 * Displays all available plans that users can subscribe to.
 * When user has an active subscription, all plan buttons are disabled
 * to enforce single subscription policy.
 */
export function PlansList({
    plans,
    currentSubscription,
    isCreating = false,
    onChangeSubscription,
}: PlansListProps) {
    // User has an active subscription if currentSubscription exists
    const hasActiveSubscription = currentSubscription !== undefined;

    if (plans.length === 0) {
        return (
            <div className={styles.empty}>
                <p className={styles.emptyText}>No plans available</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {hasActiveSubscription && (
                <div className={styles.activeSubscriptionNotice}>
                    <p className={styles.noticeText}>
                        You already have an active subscription. To change
                        plans, please cancel your current subscription first.
                    </p>
                </div>
            )}
            <div className={styles.grid}>
                {plans.map((plan) => (
                    <PlanCard
                        key={plan.id}
                        plan={plan}
                        isCurrent={isCurrentPlan(currentSubscription, plan.id)}
                        isCreating={isCreating}
                        hasActiveSubscription={hasActiveSubscription}
                        onChangeSubscription={(planId, planCode) =>
                            onChangeSubscription(planId, planCode, plan)
                        }
                    />
                ))}
            </div>
        </div>
    );
}
