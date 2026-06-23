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
    BillingOverviewResponseSchema,
    InvoiceListResponseSchema,
    PlanChangePreviewRequestSchema,
    PlanChangePreviewResponseSchema,
    ChangePlanRequestSchema,
    SubscriptionActionResponseSchema,
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

/**
 * Aggregated billing overview for the plan management page.
 */
export function useBillingOverview() {
    return useGet("/stripe/billing", BillingOverviewResponseSchema);
}

/**
 * Recent invoices for the current user.
 */
export function useInvoices() {
    return useGet("/stripe/invoices", InvoiceListResponseSchema);
}

/**
 * Preview the proration for a plan change.
 */
export function usePreviewPlanChange() {
    return usePost(
        "/stripe/subscription/preview",
        PlanChangePreviewRequestSchema,
        PlanChangePreviewResponseSchema
    );
}

/**
 * Apply a plan change (paid → paid).
 */
export function useChangePlan() {
    return usePost(
        "/stripe/subscription/change",
        ChangePlanRequestSchema,
        SubscriptionActionResponseSchema,
        ["/stripe/billing", "/stripe/invoices"]
    );
}

/**
 * Cancel the subscription at period end.
 */
export function useCancelSubscription() {
    return usePost(
        "/stripe/subscription/cancel",
        z.object({}),
        SubscriptionActionResponseSchema,
        ["/stripe/billing"]
    );
}

/**
 * Resume a subscription scheduled to cancel.
 */
export function useResumeSubscription() {
    return usePost(
        "/stripe/subscription/resume",
        z.object({}),
        SubscriptionActionResponseSchema,
        ["/stripe/billing"]
    );
}
