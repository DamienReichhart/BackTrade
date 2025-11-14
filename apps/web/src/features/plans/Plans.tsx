import { Button } from "../../components";
import { LoadingState } from "../dashboard/components/LoadingState";
import { ErrorState } from "../dashboard/components/ErrorState";
import { CurrentSubscription } from "./components/CurrentSubscription/CurrentSubscription";
import { SubscriptionList } from "./components/SubscriptionList/SubscriptionList";
import { PlansList } from "./components/PlanList/PlansList";
import { usePlansData, useSubscriptionManagement } from "./hooks";
import styles from "./Plans.module.css";

/**
 * Plans page component
 *
 * Displays user subscriptions (current and all) and available plans
 */
export function Plans() {
  const { subscriptions, plans, currentSubscription, isLoading, error } =
    usePlansData();

  const { handleChangeSubscription, handleManageSubscriptions, isCreating } =
    useSubscriptionManagement();

  // Show loading state if either is loading
  if (isLoading) {
    return (
      <div className={styles.container}>
        <LoadingState />
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className={styles.container}>
        <ErrorState error={error} />
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
            isCreating={isCreating}
            onChangeSubscription={(planId, planCode, plan) =>
              handleChangeSubscription(
                planId,
                planCode,
                currentSubscription?.id,
                plan,
              )
            }
          />
        </section>
      </div>
    </div>
  );
}
