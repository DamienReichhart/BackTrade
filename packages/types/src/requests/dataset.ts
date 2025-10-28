import { z } from "zod";
import { DatasetSchema } from "../entities";
import { TimeframeSchema } from "../enums";

export const CreateDatasetRequestSchema = z.object({
  instrument_id: z.number().int().positive(),
  timeframe: TimeframeSchema,
  file_id: z.number().int().positive(),
  start_ts: z.iso.datetime(),
  end_ts: z.iso.datetime(),
});
export type CreateDatasetRequest = z.infer<typeof CreateDatasetRequestSchema>;

export const UpdateDatasetRequestSchema = z.object({
  instrument_id: z.number().int().positive().optional(),
  timeframe: TimeframeSchema.optional(),
  start_date: z.iso.datetime().optional(),
  end_date: z.iso.datetime().optional(),
  is_active: z.boolean().optional(),
});
export type UpdateDatasetRequest = z.infer<typeof UpdateDatasetRequestSchema>;

export const DatasetListResponseSchema = z.object({
  datasets: z.array(DatasetSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
});
export type DatasetListResponse = z.infer<typeof DatasetListResponseSchema>;
