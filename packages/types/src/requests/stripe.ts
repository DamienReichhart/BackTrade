/**
 * Stripe Request/Response Types
 *
 * Zod schemas and types for Stripe API operations.
 */

import { z } from "zod";

/**
 * Create Checkout Session Request
 */
export const CreateCheckoutSessionRequestSchema = z.object({
    planId: z.number().int().positive(),
});
export type CreateCheckoutSessionRequest = z.infer<
    typeof CreateCheckoutSessionRequestSchema
>;

/**
 * Checkout Session Response
 */
export const CheckoutSessionResponseSchema = z.object({
    sessionId: z.string(),
    url: z.string().url(),
});
export type CheckoutSessionResponse = z.infer<
    typeof CheckoutSessionResponseSchema
>;

/**
 * Portal Session Response
 */
export const PortalSessionResponseSchema = z.object({
    url: z.string().url(),
});
export type PortalSessionResponse = z.infer<typeof PortalSessionResponseSchema>;

/**
 * Checkout Session Status Response
 */
export const CheckoutSessionStatusResponseSchema = z.object({
    status: z.string(),
    subscriptionId: z.string().nullable(),
    customerId: z.string().nullable(),
});
export type CheckoutSessionStatusResponse = z.infer<
    typeof CheckoutSessionStatusResponseSchema
>;
