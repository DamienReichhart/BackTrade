import { z } from "zod";
import {
    SubscriptionStatusSchema,
    UpdateSubscriptionRequestSchema,
} from "@backtrade/types";

/**
 * Create subscription form schema.
 * All fields use string types to handle HTML form inputs.
 */
export const CreateSubscriptionFormSchema = z
    .object({
        plan_id: z.string().min(1, "Plan is required"),
        stripe_subscription_id: z
            .string()
            .min(1, "Stripe Subscription ID is required"),
        current_period_start: z.string().min(1, "Start date is required"),
        current_period_end: z.string().min(1, "End date is required"),
        status: SubscriptionStatusSchema.optional(),
        cancel_at_period_end: z.boolean(),
    })
    .refine(
        (data) => {
            const start = new Date(data.current_period_start);
            const end = new Date(data.current_period_end);
            return end > start;
        },
        {
            message: "End date must be after start date",
            path: ["current_period_end"],
        }
    );

export type CreateSubscriptionFormState = z.infer<
    typeof CreateSubscriptionFormSchema
>;

export const SubscriptionEditFormSchema = UpdateSubscriptionRequestSchema;

export type SubscriptionEditFormState = z.infer<
    typeof SubscriptionEditFormSchema
>;
