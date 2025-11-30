import type { Subscription, Plan } from "@backtrade/types";
import { formatDate } from "@backtrade/utils";
import { formatPlanTitle } from "../../utils";
import { usePlanLookup } from "./hooks";
import { formatPeriod, getStatusColor } from "./utils";
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
  const plan = usePlanLookup(plans, subscription.plan_id);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3 className={styles.title}>
            {formatPlanTitle(plan?.code, subscription.plan_id)}
          </h3>
          <span
            className={`${styles.status} ${getStatusColor(
              subscription.status,
              styles,
            )}`}
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
