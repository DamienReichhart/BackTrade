import { useCallback, useState } from "react";
import { useAuthStore } from "../../../store/auth";
import {
    useCreateCheckoutSession,
    useCreatePortalSession,
} from "../../../api/hooks/requests/stripe";
import type { Plan } from "@backtrade/types";

/**
 * Hook to handle subscription management operations
 *
 * Uses Stripe Checkout for new subscriptions and Customer Portal for management.
 *
 * @returns Subscription management handlers and loading state
 */
export function useSubscriptionManagement() {
    const { user } = useAuthStore();
    const [isRedirecting, setIsRedirecting] = useState(false);

    const { execute: createCheckoutSession, isLoading: isCreatingCheckout } =
        useCreateCheckoutSession();
    const { execute: createPortalSession, isLoading: isCreatingPortal } =
        useCreatePortalSession();

    /**
     * Handle manage subscriptions action
     *
     * Creates a Stripe Customer Portal session and redirects to Stripe.
     */
    const handleManageSubscriptions = useCallback(async () => {
        if (!user) {
            // eslint-disable-next-line no-console
            console.error("User must be authenticated to manage subscriptions");
            return;
        }

        try {
            setIsRedirecting(true);

            // Create Stripe Customer Portal session
            const session = await createPortalSession({});

            // Redirect to Stripe Customer Portal
            window.location.href = session.url;
        } catch (err) {
            setIsRedirecting(false);
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "Failed to open subscription management. Please try again.";
            // eslint-disable-next-line no-console
            console.error("Portal session error:", errorMessage);
            throw err;
        }
    }, [user, createPortalSession]);

    /**
     * Handle subscription change (purchase a new plan)
     *
     * Creates a Stripe Checkout session and redirects to Stripe.
     * If user already has an active subscription, redirects to portal instead.
     *
     * @param planId - Plan ID to subscribe to
     * @param _planCode - Plan code (unused, kept for API compatibility)
     * @param currentSubscriptionId - Current subscription ID (if exists, redirects to portal)
     * @param _plan - Plan object (unused, kept for API compatibility)
     */
    const handleChangeSubscription = useCallback(
        async (
            planId: number,
            _planCode: string,
            currentSubscriptionId?: number,
            _plan?: Plan
        ) => {
            if (!user) {
                // eslint-disable-next-line no-console
                console.error(
                    "User must be authenticated to create a subscription"
                );
                return;
            }

            // If user has active subscription, redirect to portal for changes
            if (currentSubscriptionId !== undefined) {
                await handleManageSubscriptions();
                return;
            }

            try {
                setIsRedirecting(true);

                // Create Stripe Checkout session
                const session = await createCheckoutSession({ planId });

                // Redirect to Stripe Checkout
                window.location.href = session.url;
            } catch (err) {
                setIsRedirecting(false);
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : "Failed to create checkout session. Please try again.";
                // eslint-disable-next-line no-console
                console.error("Checkout session error:", errorMessage);
                throw err;
            }
        },
        [user, createCheckoutSession, handleManageSubscriptions]
    );

    return {
        handleChangeSubscription,
        handleManageSubscriptions,
        isCreating: isCreatingCheckout || isCreatingPortal || isRedirecting,
    };
}
