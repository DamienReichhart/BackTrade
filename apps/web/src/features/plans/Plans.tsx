import { useMemo } from "react";
import { Button } from "../../components";
import { useAuthStore } from "../../context/AuthContext";
import { useSubscriptionsByUser } from "../../api/requests/subscriptions";
import { usePlans } from "../../api/requests/plans";
import { LoadingState } from "../dashboard/components/LoadingState";
import { ErrorState } from "../dashboard/components/ErrorState";
import { CurrentSubscription } from "./components/CurrentSubscription/CurrentSubscription";
import { SubscriptionList } from "./components/SubscriptionList/SubscriptionList";
import { PlansList } from "./components/PlanList/PlansList";
import type { Subscription } from "@backtrade/types";
import styles from "./Plans.module.css";

/**
 * Plans page component
 *
 * Displays user subscriptions (current and all) and available plans
 */
export function Plans() {
  const { user } = useAuthStore();
  const userId = user?.id.toString();

  // Fetch user subscriptions (only when user is authenticated)
  const {
    data: subscriptionsData,
    isLoading: isLoadingSubscriptions,
    error: subscriptionsError,
  } = useSubscriptionsByUser(userId);

  // Fetch available plans
  const {
    data: plansData,
    isLoading: isLoadingPlans,
    error: plansError,
  } = usePlans();

  const subscriptions = (subscriptionsData as Subscription[]) ?? [];
  const plans = plansData ?? [];

  // Find current subscription (active or trialing)
  const currentSubscription = useMemo(() => {
    return subscriptions.find(
      (sub) => sub.status === "active" || sub.status === "trialing",
    );
  }, [subscriptions]);

  // Handle subscription change
  const handleChangeSubscription = (planId: number, planCode: string) => {
    // eslint-disable-next-line no-console
    console.log("Change subscription requested:", {
      planId,
      planCode,
      currentSubscriptionId: currentSubscription?.id,
    });
  };

  // Handle manage subscriptions
  const handleManageSubscriptions = () => {
    // eslint-disable-next-line no-console
    console.log("manage subscription");
  };

  // Show loading state if either is loading
  if (isLoadingSubscriptions || isLoadingPlans) {
    return (
      <div className={styles.container}>
        <LoadingState />
      </div>
    );
  }

  // Show error state if there's an error
  if (subscriptionsError || plansError) {
    return (
      <div className={styles.container}>
        <ErrorState error={(subscriptionsError ?? plansError) as Error} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>Plans & Subscriptions</h1>
        <Button
          variant="outline"
          size="medium"
          onClick={handleManageSubscriptions}
        >
          Manage Subscriptions
        </Button>
      </header>

      {/* Content */}
      <div className={styles.content}>
        {/* Current Subscription Section */}
        {currentSubscription && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Current Subscription</h2>
            <CurrentSubscription
              subscription={currentSubscription}
              plans={plans}
            />
          </section>
        )}

        {/* All Subscriptions Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            All Subscriptions ({subscriptions.length})
          </h2>
          <SubscriptionList
            subscriptions={subscriptions}
            plans={plans}
            currentSubscriptionId={currentSubscription?.id}
          />
        </section>

        {/* Available Plans Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            Available Plans ({plans.length})
          </h2>
          <PlansList
            plans={plans}
            currentSubscription={currentSubscription}
            onChangeSubscription={handleChangeSubscription}
          />
        </section>
      </div>
    </div>
  );
}
