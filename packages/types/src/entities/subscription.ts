import { z } from "zod";
import { SubscriptionStatusSchema } from "../enums";

export const SubscriptionSchema = z.object({
  id: z.number().int().positive(),
  user_id: z.number().int().positive(),
  plan_id: z.number().int().positive(),
  stripe_subscription_id: z.string(),
  status: SubscriptionStatusSchema,
  current_period_start: z.iso.datetime(),
  current_period_end: z.iso.datetime(),
  cancel_at_period_end: z.boolean().default(false),
  canceled_at: z.iso.datetime().nullable().optional(),
  trial_end: z.iso.datetime().nullable().optional(),
});
export type Subscription = z.infer<typeof SubscriptionSchema>;
