import { z } from "zod";

export const StripeEventSchema = z.object({
  id: z.number().int().positive(),
  stripe_event_id: z.string(),
  type: z.string(),
  payload: z.record(z.string(), z.unknown()),
  received_at: z.iso.datetime(),
  processed_at: z.iso.datetime().optional(),
  created_at: z.string().optional(), // optional only for the front only, will be required when backend is impelemnted
  updated_at: z.string().optional(),
});
export type StripeEvent = z.infer<typeof StripeEventSchema>;
