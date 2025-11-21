import { useState, useMemo } from "react";
import type {
  PublicUser,
  Subscription,
  Plan,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
} from "@backtrade/types";
import {
  useSubscriptionsByUser,
  useCreateSubscription,
  useUpdateSubscription,
  useDeleteSubscription,
} from "../../../../../../api/hooks/requests/subscriptions";
import { usePlans } from "../../../../../../api/hooks/requests/plans";
import { useModalBehavior } from "../../../../../../hooks/useModalBehavior";

/**
 * Subscription status options for select
 */
export const SUBSCRIPTION_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "canceled", label: "Canceled" },
  { value: "trialing", label: "Trialing" },
  { value: "active_unpaid", label: "Active Unpaid" },
];

/**
 * Hook for managing subscription management modal state and logic
 */
export function useSubscriptionManagementModal(
  user: PublicUser,
  isOpen: boolean,
  onClose: () => void,
) {
  const userId = user.id.toString();

  // Fetch subscriptions and plans
  const {
    data: subscriptionsData,
    isLoading: isLoadingSubscriptions,
    execute: refetchSubscriptions,
  } = useSubscriptionsByUser(userId);

  const { data: plansData, isLoading: isLoadingPlans } = usePlans();

  const subscriptions: Subscription[] = useMemo(() => {
    return (subscriptionsData as Subscription[]) ?? [];
  }, [subscriptionsData]);

  const plans: Plan[] = useMemo(() => {
    return plansData ?? [];
  }, [plansData]);

  // Form state for creating new subscription
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState<
    Partial<CreateSubscriptionRequest>
  >(() => {
    const now = Date.now();
    return {
      user_id: user.id,
      plan_id: undefined,
      stripe_subscription_id: "",
      current_period_start: new Date(now).toISOString(),
      current_period_end: new Date(
        now + 30 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      status: "active",
      cancel_at_period_end: false,
    };
  });

  // Form state for editing subscription
  const [editingSubscriptionId, setEditingSubscriptionId] = useState<
    number | null
  >(null);
  const [editForm, setEditForm] = useState<Partial<UpdateSubscriptionRequest>>(
    {},
  );

  // Delete confirmation state
  const [subscriptionToDelete, setSubscriptionToDelete] =
    useState<Subscription | null>(null);
  const [subscriptionToDeleteId, setSubscriptionToDeleteId] =
    useState<string>("0");

  // Mutations
  const createSubscriptionMutation = useCreateSubscription();
  const updateSubscriptionMutation = useUpdateSubscription(
    editingSubscriptionId?.toString() ?? "0",
  );
  const deleteSubscriptionMutation = useDeleteSubscription(
    subscriptionToDeleteId,
  );

  // Handle modal behavior (Escape key, body scroll)
  useModalBehavior(isOpen, onClose);

  // Plan lookup helper
  const getPlanById = (planId: number): Plan | undefined => {
    return plans.find((p) => p.id === planId);
  };

  // Plan options for select
  const planOptions = useMemo(() => {
    return plans.map((plan) => ({
      value: plan.id.toString(),
      label: `${plan.code} (${plan.currency} ${plan.price})`,
    }));
  }, [plans]);

  /**
   * Reset create form to initial state
   */
  const resetCreateForm = () => {
    const now = Date.now();
    setCreateForm({
      user_id: user.id,
      plan_id: undefined,
      stripe_subscription_id: "",
      current_period_start: new Date(now).toISOString(),
      current_period_end: new Date(
        now + 30 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      status: "active",
      cancel_at_period_end: false,
    });
  };

  /**
   * Handle create subscription
   */
  const handleCreate = async () => {
    if (!createForm.plan_id || !createForm.stripe_subscription_id) {
      return;
    }

    try {
      await createSubscriptionMutation.execute(
        createForm as CreateSubscriptionRequest,
      );
      setIsCreating(false);
      resetCreateForm();
      await refetchSubscriptions();
    } catch {
      // Error handling is done by the mutation hook
    }
  };

  /**
   * Handle start creating subscription
   */
  const handleStartCreate = () => {
    setIsCreating(true);
  };

  /**
   * Handle cancel creating subscription
   */
  const handleCancelCreate = () => {
    setIsCreating(false);
    resetCreateForm();
  };

  /**
   * Handle start editing subscription
   */
  const handleStartEdit = (subscription: Subscription) => {
    setEditingSubscriptionId(subscription.id);
    setEditForm({
      status: subscription.status,
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at ?? undefined,
      trial_end: subscription.trial_end ?? undefined,
    });
  };

  /**
   * Handle cancel editing
   */
  const handleCancelEdit = () => {
    setEditingSubscriptionId(null);
    setEditForm({});
  };

  /**
   * Handle update subscription
   */
  const handleUpdate = async () => {
    if (!editingSubscriptionId) return;

    try {
      await updateSubscriptionMutation.execute(
        editForm as UpdateSubscriptionRequest,
      );
      setEditingSubscriptionId(null);
      setEditForm({});
      await refetchSubscriptions();
    } catch {
      // Error handling is done by the mutation hook
    }
  };

  /**
   * Handle delete subscription
   */
  const handleDelete = (subscription: Subscription) => {
    setSubscriptionToDelete(subscription);
    setSubscriptionToDeleteId(subscription.id.toString());
  };

  /**
   * Confirm delete subscription
   */
  const handleConfirmDelete = async () => {
    if (!subscriptionToDelete) return;

    try {
      await deleteSubscriptionMutation.execute();
      setSubscriptionToDelete(null);
      setSubscriptionToDeleteId("0");
      await refetchSubscriptions();
    } catch {
      // Error handling is done by the mutation hook
    }
  };

  /**
   * Handle cancel delete
   */
  const handleCancelDelete = () => {
    setSubscriptionToDelete(null);
    setSubscriptionToDeleteId("0");
  };

  return {
    // Data
    subscriptions,
    plans,
    isLoading: isLoadingSubscriptions || isLoadingPlans,

    // Create form state
    isCreating,
    createForm,
    setCreateForm,

    // Edit form state
    editingSubscriptionId,
    editForm,
    setEditForm,

    // Delete state
    subscriptionToDelete,

    // Mutations
    createSubscriptionMutation,
    updateSubscriptionMutation,
    deleteSubscriptionMutation,

    // Helpers
    getPlanById,
    planOptions,

    // Handlers
    handleStartCreate,
    handleCancelCreate,
    handleCreate,
    handleStartEdit,
    handleCancelEdit,
    handleUpdate,
    handleDelete,
    handleConfirmDelete,
    handleCancelDelete,
  };
}
