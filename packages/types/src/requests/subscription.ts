import { z } from "zod";
import { SubscriptionStatusSchema } from "../enums";

export const CreateSubscriptionRequestSchema = z.object({
  user_id: z.number().int().positive(),
  plan_id: z.number().int().positive(),
  stripe_subscription_id: z.string().min(1),
  current_period_start: z.iso.datetime(),
  current_period_end: z.iso.datetime(),
  cancel_at_period_end: z.boolean().default(false),
  trial_end: z.iso.datetime().optional(),
});
export type CreateSubscriptionRequest = z.infer<
  typeof CreateSubscriptionRequestSchema
>;

export const UpdateSubscriptionRequestSchema = z.object({
  status: SubscriptionStatusSchema.optional(),
  cancel_at_period_end: z.boolean().optional(),
  canceled_at: z.iso.datetime().optional(),
  trial_end: z.iso.datetime().optional(),
});
export type UpdateSubscriptionRequest = z.infer<
  typeof UpdateSubscriptionRequestSchema
>;
