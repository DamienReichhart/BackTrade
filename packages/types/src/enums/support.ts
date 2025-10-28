import { z } from "zod";

export const SupportStatusSchema = z.enum([
  "OPEN",
  "CLOSED",
  "PENDING_APPROVAL",
]);
export type SupportStatus = z.infer<typeof SupportStatusSchema>;
