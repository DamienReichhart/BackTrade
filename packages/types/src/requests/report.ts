import { z } from "zod";
import { ReportSchema } from "../entities";

export const CreateReportRequestSchema = z.object({
  session_id: z.number().int().positive(),
  summary_json: z.record(z.string(), z.unknown()),
  equity_curve_json: z.record(z.string(), z.unknown()),
});
export type CreateReportRequest = z.infer<typeof CreateReportRequestSchema>;

export const UpdateReportRequestSchema = z.object({
  summary_json: z.record(z.string(), z.unknown()).optional(),
  equity_curve_json: z.record(z.string(), z.unknown()).optional(),
});
export type UpdateReportRequest = z.infer<typeof UpdateReportRequestSchema>;

export const ReportListResponseSchema = z.array(ReportSchema);
export type ReportListResponse = z.infer<typeof ReportListResponseSchema>;

export const GenerateReportRequestSchema = z.object({
  include_equity_curve: z.boolean().default(true),
  include_transactions: z.boolean().default(true),
  include_positions: z.boolean().default(true),
});
export type GenerateReportRequest = z.infer<typeof GenerateReportRequestSchema>;
