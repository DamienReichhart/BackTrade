import { z } from "zod";

export const SessionAnalyticsSchema = z.object({
  id: z.number().int().positive(),
  session_id: z.number().int().positive(),
  file_name: z.string(),
  modified_at: z.iso.datetime(),
  created_at: z.string(),
});
export type SessionAnalytics = z.infer<typeof SessionAnalyticsSchema>;
