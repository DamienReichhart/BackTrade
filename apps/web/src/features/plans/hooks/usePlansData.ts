import { useMemo } from "react";
import type { Subscription, Plan } from "@backtrade/types";
import { useAuthStore } from "../../../context/AuthContext";
import { useSubscriptionsByUser } from "../../../api/hooks/requests/subscriptions";
import { usePlans } from "../../../api/hooks/requests/plans";
import { findCurrentSubscription } from "../utils/subscriptions";

/**
 * Hook to manage plans page data fetching and state
 *
 * @returns Plans data, subscriptions, loading states, and errors
 */
export function usePlansData() {
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

  // Normalize data
  const subscriptions: Subscription[] = useMemo(() => {
    return (subscriptionsData as Subscription[]) ?? [];
  }, [subscriptionsData]);

  const plans: Plan[] = useMemo(() => {
    return plansData ?? [];
  }, [plansData]);

  // Find current subscription (active or trialing)
  const currentSubscription = useMemo(() => {
    return findCurrentSubscription(subscriptions);
  }, [subscriptions]);

  // Combined loading state
  const isLoading = isLoadingSubscriptions || isLoadingPlans;

  // Combined error state
  const error = subscriptionsError ?? plansError;

  return {
    subscriptions,
    plans,
    currentSubscription,
    isLoading,
    error: error as Error | null,
  };
}
