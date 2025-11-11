import type { Subscription, Plan } from "@backtrade/types";
import { SubscriptionCard } from "../SubscriptionCard";
import styles from "./SubscriptionList.module.css";

interface SubscriptionListProps {
  subscriptions: Subscription[];
  plans: Plan[];
  currentSubscriptionId?: number;
}

/**
 * Subscription list component
 *
 * Displays all user subscriptions
 */
export function SubscriptionList({
  subscriptions,
  plans,
  currentSubscriptionId,
}: SubscriptionListProps) {
  if (subscriptions.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyText}>No subscriptions found</p>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {subscriptions.map((subscription) => (
        <SubscriptionCard
          key={subscription.id}
          subscription={subscription}
          plans={plans}
          isCurrent={subscription.id === currentSubscriptionId}
        />
      ))}
    </div>
  );
}
