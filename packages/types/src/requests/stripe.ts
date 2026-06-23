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

/**
 * Derived, user-facing subscription status.
 */
export const BillingStatusSchema = z.enum([
    "free",
    "active",
    "canceling",
    "past_due",
]);
export type BillingStatus = z.infer<typeof BillingStatusSchema>;

/**
 * The plan portion of the billing overview (major currency units).
 */
export const BillingOverviewPlanSchema = z.object({
    code: z.string(),
    displayName: z.string(),
    price: z.number(),
    currency: z.string(),
    maxActiveSessions: z.number().int().positive(),
});
export type BillingOverviewPlan = z.infer<typeof BillingOverviewPlanSchema>;

export const BillingPaymentMethodSchema = z.object({
    brand: z.string(),
    last4: z.string(),
    expMonth: z.number().int(),
    expYear: z.number().int(),
});
export type BillingPaymentMethod = z.infer<typeof BillingPaymentMethodSchema>;

export const BillingNextChargeSchema = z.object({
    amount: z.number(),
    currency: z.string(),
    date: z.string(),
});
export type BillingNextCharge = z.infer<typeof BillingNextChargeSchema>;

/**
 * Aggregated billing overview returned by GET /stripe/billing.
 */
export const BillingOverviewResponseSchema = z.object({
    status: BillingStatusSchema,
    plan: BillingOverviewPlanSchema,
    currentPeriodEnd: z.string().nullable(),
    cancelAtPeriodEnd: z.boolean(),
    nextCharge: BillingNextChargeSchema.nullable(),
    paymentMethod: BillingPaymentMethodSchema.nullable(),
});
export type BillingOverviewResponse = z.infer<
    typeof BillingOverviewResponseSchema
>;

/**
 * A single invoice (amount in major currency units).
 */
export const InvoiceSchema = z.object({
    id: z.string(),
    number: z.string().nullable(),
    date: z.string(),
    amount: z.number(),
    currency: z.string(),
    status: z.string(),
    hostedUrl: z.string().nullable(),
    pdfUrl: z.string().nullable(),
});
export type Invoice = z.infer<typeof InvoiceSchema>;

export const InvoiceListResponseSchema = z.array(InvoiceSchema);
export type InvoiceListResponse = z.infer<typeof InvoiceListResponseSchema>;

/**
 * Proration preview for a plan change.
 */
export const PlanChangePreviewRequestSchema = z.object({
    planId: z.number().int().positive(),
});
export type PlanChangePreviewRequest = z.infer<
    typeof PlanChangePreviewRequestSchema
>;

export const PlanChangePreviewResponseSchema = z.object({
    amountDueToday: z.number(),
    currency: z.string(),
    nextChargeAmount: z.number(),
    nextChargeDate: z.string(),
    isUpgrade: z.boolean(),
});
export type PlanChangePreviewResponse = z.infer<
    typeof PlanChangePreviewResponseSchema
>;

/**
 * Apply a plan change.
 */
export const ChangePlanRequestSchema = z.object({
    planId: z.number().int().positive(),
});
export type ChangePlanRequest = z.infer<typeof ChangePlanRequestSchema>;

/**
 * Returned by change/cancel/resume actions.
 */
export const SubscriptionActionResponseSchema = z.object({
    status: BillingStatusSchema,
    cancelAtPeriodEnd: z.boolean(),
    currentPeriodEnd: z.string().nullable(),
});
export type SubscriptionActionResponse = z.infer<
    typeof SubscriptionActionResponseSchema
>;
