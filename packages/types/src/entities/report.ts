import { z } from "zod";

export const ReportSchema = z.object({
  id: z.number().int().positive(),
  session_id: z.number().int().positive(),
  summary_json: z.record(z.string(), z.unknown()),
  equity_curve_json: z.record(z.string(), z.unknown()),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Report = z.infer<typeof ReportSchema>;
