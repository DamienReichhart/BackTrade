import { useMemo } from "react";
import type { Subscription, Plan } from "@backtrade/types";
import { formatDate } from "@backtrade/utils";
import styles from "./SubscriptionCard.module.css";

interface SubscriptionCardProps {
  subscription: Subscription;
  plans: Plan[];
  isCurrent?: boolean;
}

/**
 * Subscription card component
 *
 * Displays information about a single subscription
 */
export function SubscriptionCard({
  subscription,
  plans,
  isCurrent = false,
}: SubscriptionCardProps) {
  // Find the plan associated with this subscription
  const plan = useMemo(() => {
    return plans.find((p) => p.id === subscription.plan_id);
  }, [plans, subscription.plan_id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return styles.statusActive;
      case "trialing":
        return styles.statusTrialing;
      case "canceled":
        return styles.statusCanceled;
      case "active_unpaid":
        return styles.statusActiveUnpaid;
      default:
        return "";
    }
  };

  const formatPeriod = (start: string, end: string) => {
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  return (
    <div className={`${styles.card} ${isCurrent ? styles.current : ""}`}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3 className={styles.title}>
            {plan?.code
              ? plan.code.toUpperCase()
              : `Plan #${subscription.plan_id}`}
            {isCurrent && <span className={styles.currentBadge}>Current</span>}
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
            <span className={styles.label}>Subscription ID:</span>
            <span className={styles.value}>#{subscription.id}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Plan ID:</span>
            <span className={styles.value}>{subscription.plan_id}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Status:</span>
            <span className={styles.value}>{subscription.status}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Period:</span>
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
          {subscription.canceled_at && (
            <div className={styles.infoItem}>
              <span className={styles.label}>Canceled At:</span>
              <span className={styles.value}>
                {formatDate(subscription.canceled_at)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
