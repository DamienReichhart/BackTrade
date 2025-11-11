import { useMemo } from "react";
import type { Subscription, Plan } from "@backtrade/types";
import { formatDate } from "../../../../utils";
import { getStatusColorClass } from "../../utils/subscriptions";
import styles from "./CurrentSubscription.module.css";

interface CurrentSubscriptionProps {
  subscription: Subscription;
  plans: Plan[];
}

/**
 * Current subscription component
 *
 * Displays the user's active or trialing subscription
 */
export function CurrentSubscription({
  subscription,
  plans,
}: CurrentSubscriptionProps) {
  // Find the plan associated with this subscription
  const plan = useMemo(() => {
    return plans.find((p) => p.id === subscription.plan_id);
  }, [plans, subscription.plan_id]);

  const getStatusColor = (status: string) => {
    const colorClass = getStatusColorClass(status);
    return colorClass ? (styles[colorClass] ?? "") : "";
  };

  const formatPeriod = (start: string, end: string) => {
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3 className={styles.title}>
            {plan?.code
              ? plan.code.toUpperCase()
              : `Plan #${subscription.plan_id}`}
          </h3>
          <span
            className={`${styles.status} ${getStatusColor(subscription.status)}`}
          >
            {subscription.status}
          </span>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.info}>
          <div className={styles.infoItem}>
            <span className={styles.label}>Plan ID:</span>
            <span className={styles.value}>{subscription.plan_id}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Status:</span>
            <span className={styles.value}>{subscription.status}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Current Period:</span>
            <span className={styles.value}>
              {formatPeriod(
                subscription.current_period_start,
                subscription.current_period_end,
              )}
            </span>
          </div>
          {subscription.trial_end && (
            <div className={styles.infoItem}>
              <span className={styles.label}>Trial Ends:</span>
              <span className={styles.value}>
                {formatDate(subscription.trial_end)}
              </span>
            </div>
          )}
          {subscription.cancel_at_period_end && (
            <div className={styles.infoItem}>
              <span className={styles.label}>Cancellation:</span>
              <span className={styles.value}>Will cancel at period end</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
