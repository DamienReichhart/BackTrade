import { z } from "zod";

export const StripeEventSchema = z.object({
  id: z.number().int().positive(),
  stripe_event_id: z.string(),
  type: z.string(),
  payload: z.record(z.string(), z.unknown()),
  received_at: z.iso.datetime(),
  processed_at: z.iso.datetime().optional(),
  success: z.boolean().default(false),
  error: z.string().optional(),
});
export type StripeEvent = z.infer<typeof StripeEventSchema>;
