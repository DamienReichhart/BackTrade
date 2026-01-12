/**
 * Stripe API Hooks
 *
 * Hooks for Stripe operations including checkout sessions and customer portal.
 */

import { useGet, usePost } from "..";
import {
    CreateCheckoutSessionRequestSchema,
    CheckoutSessionResponseSchema,
    PortalSessionResponseSchema,
    CheckoutSessionStatusResponseSchema,
} from "@backtrade/types";
import { z } from "zod";

/**
 * Create a Stripe Checkout Session
 *
 * @returns Mutation hook for creating checkout sessions
 */
export function useCreateCheckoutSession() {
    return usePost(
        "/stripe/checkout",
        CreateCheckoutSessionRequestSchema,
        CheckoutSessionResponseSchema
    );
}

/**
 * Create a Stripe Customer Portal Session
 *
 * @returns Mutation hook for creating portal sessions
 */
export function useCreatePortalSession() {
    return usePost("/stripe/portal", z.object({}), PortalSessionResponseSchema);
}

/**
 * Get Checkout Session status
 *
 * Used to verify successful checkout on the success page.
 *
 * @param sessionId - Checkout session ID from URL params
 * @returns Query hook with session status
 */
export function useCheckoutSession(sessionId: string | null) {
    return useGet(
        `/stripe/checkout/${sessionId ?? ""}`,
        CheckoutSessionStatusResponseSchema,
        { enabled: !!sessionId }
    );
}
