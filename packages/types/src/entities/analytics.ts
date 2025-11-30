import { z } from "zod";

export const SessionAnalyticsSchema = z.object({
  id: z.number().int().positive(),
  session_id: z.number().int().positive(),
  file_name: z.string(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export type SessionAnalytics = z.infer<typeof SessionAnalyticsSchema>;
