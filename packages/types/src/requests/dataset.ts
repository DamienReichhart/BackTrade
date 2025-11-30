import { z } from "zod";
import { DatasetSchema } from "../entities";
import { TimeframeSchema } from "../enums";

export const CreateDatasetRequestSchema = z.object({
  instrument_id: z.number().int().positive(),
  timeframe: TimeframeSchema,
});
export type CreateDatasetRequest = z.infer<typeof CreateDatasetRequestSchema>;

export const UpdateDatasetRequestSchema = z.object({
  instrument_id: z.number().int().positive(),
  timeframe: TimeframeSchema,
});
export type UpdateDatasetRequest = z.infer<typeof UpdateDatasetRequestSchema>;

export const DatasetListResponseSchema = z.array(DatasetSchema);
export type DatasetListResponse = z.infer<typeof DatasetListResponseSchema>;
