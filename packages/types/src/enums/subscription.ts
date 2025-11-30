import { z } from "zod";

export const SubscriptionStatusSchema = z.enum([
  "active",
  "canceled",
  "trialing",
  "active_unpaid",
]);
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusSchema>;
