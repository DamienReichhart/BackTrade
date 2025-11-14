import type { Subscription, Plan } from "@backtrade/types";
import { PlanCard } from "../PlanCard/PlanCard";
import { isCurrentPlan } from "./utils";
import styles from "./PlansList.module.css";

interface PlansListProps {
  plans: Plan[];
  currentSubscription: Subscription | undefined;
  isCreating?: boolean;
  onChangeSubscription: (planId: number, planCode: string, plan: Plan) => void;
}

/**
 * Plans list component
 *
 * Displays all available plans that users can subscribe to
 */
export function PlansList({
  plans,
  currentSubscription,
  isCreating = false,
  onChangeSubscription,
}: PlansListProps) {
  if (plans.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyText}>No plans available</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {plans.map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          isCurrent={isCurrentPlan(currentSubscription, plan.id)}
          isCreating={isCreating}
          onChangeSubscription={(planId, planCode) =>
            onChangeSubscription(planId, planCode, plan)
          }
        />
      ))}
    </div>
  );
}
