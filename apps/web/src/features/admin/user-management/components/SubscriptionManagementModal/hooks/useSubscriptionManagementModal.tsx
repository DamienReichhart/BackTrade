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
 * Hook for managing subscription management modal state and logic
 */
export function useSubscriptionManagementModal(
    user: PublicUser,
    isOpen: boolean,
    onClose: () => void
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

    /**
     * Find the active subscription (status: 'active')
     * Users should only have one active subscription at a time
     */
    const activeSubscription = useMemo(() => {
        return subscriptions.find((sub) => sub.status === "active");
    }, [subscriptions]);

    /**
     * Whether the user has an active subscription
     */
    const hasActiveSubscription = activeSubscription !== undefined;

    // View state
    const [isCreating, setIsCreating] = useState(false);
    const [editingSubscriptionId, setEditingSubscriptionId] = useState<
        number | null
    >(null);

    // Delete confirmation state
    const [subscriptionToDelete, setSubscriptionToDelete] =
        useState<Subscription | null>(null);
    const [subscriptionToDeleteId, setSubscriptionToDeleteId] =
        useState<string>("0");

    // Mutations
    const createSubscriptionMutation = useCreateSubscription();
    const updateSubscriptionMutation = useUpdateSubscription(
        editingSubscriptionId?.toString() ?? "0"
    );
    const deleteSubscriptionMutation = useDeleteSubscription(
        subscriptionToDeleteId
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
     * Handle create subscription
     */
    const handleCreate = async (data: CreateSubscriptionRequest) => {
        try {
            await createSubscriptionMutation.execute(data);
            setIsCreating(false);
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
    };

    /**
     * Handle start editing subscription
     */
    const handleStartEdit = (subscription: Subscription) => {
        setEditingSubscriptionId(subscription.id);
    };

    /**
     * Handle cancel editing
     */
    const handleCancelEdit = () => {
        setEditingSubscriptionId(null);
    };

    /**
     * Handle update subscription
     */
    const handleUpdate = async (data: UpdateSubscriptionRequest) => {
        if (!editingSubscriptionId) return;

        try {
            await updateSubscriptionMutation.execute(data);
            setEditingSubscriptionId(null);
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
        activeSubscription,
        hasActiveSubscription,

        // View state
        isCreating,
        editingSubscriptionId,

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
