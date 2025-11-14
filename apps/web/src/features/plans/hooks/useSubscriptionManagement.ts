import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../../context/AuthContext";
import { useCreateSubscription } from "../../../api/hooks/requests/subscriptions";
import type { Plan } from "@backtrade/types";

/**
 * Hook to handle subscription management operations
 *
 * @returns Subscription management handlers
 */
export function useSubscriptionManagement() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { execute: createSubscription, isLoading: isCreating } =
    useCreateSubscription();

  /**
   * Handle subscription change (purchase a new plan)
   *
   * @param planId - Plan ID to subscribe to
   * @param planCode - Plan code
   * @param currentSubscriptionId - Current subscription ID (optional)
   * @param plan - Plan object for success page (optional)
   */
  const handleChangeSubscription = useCallback(
    async (
      planId: number,
      planCode: string,
      currentSubscriptionId?: number,
      plan?: Plan,
    ) => {
      if (!user) {
        // eslint-disable-next-line no-console
        console.error("User must be authenticated to create a subscription");
        return;
      }

      try {
        // Calculate subscription period dates (monthly subscription)
        const now = new Date();
        const currentPeriodStart = now.toISOString();
        const currentPeriodEnd = new Date(
          now.getTime() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
        ).toISOString();

        // Generate a mock Stripe subscription ID for testing
        // In production, this would come from Stripe checkout session
        const stripeSubscriptionId = `sub_${Date.now()}_${Math.random()
          .toString(36)
          .substring(2, 9)}`;

        // Create the subscription
        await createSubscription({
          user_id: user.id,
          plan_id: planId,
          status: "active",
          stripe_subscription_id: stripeSubscriptionId,
          current_period_start: currentPeriodStart,
          current_period_end: currentPeriodEnd,
          cancel_at_period_end: false,
        });

        // Invalidate subscriptions queries to refresh the UI
        queryClient.invalidateQueries({
          queryKey: ["GET", "/subscriptions"],
        });
        queryClient.invalidateQueries({
          queryKey: ["GET", `/users/${user.id}/subscriptions`],
        });

        // Navigate to purchase success page with plan information
        // If plan object is not provided, we'll still navigate but the success page
        // will show minimal information
        navigate("/dashboard/plans/purchase-success", {
          state: { plan: plan ?? undefined },
        });
      } catch (err) {
        // Handle error
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to create subscription. Please try again.";
        // eslint-disable-next-line no-console
        console.error("Subscription creation error:", errorMessage);
        // In a real app, you might want to show a toast notification here
        throw err;
      }
    },
    [user, createSubscription, queryClient, navigate],
  );

  /**
   * Handle manage subscriptions action
   *
   * This could redirect to Stripe customer portal or show a management modal
   */
  const handleManageSubscriptions = useCallback(() => {
    // TODO: Implement subscription management logic
    // This should:
    // 1. Redirect to Stripe customer portal, or
    // 2. Show a modal with subscription management options
    // eslint-disable-next-line no-console
    console.log("Manage subscriptions");
  }, []);

  return {
    handleChangeSubscription,
    handleManageSubscriptions,
    isCreating,
  };
}
