import { z } from "zod";
import { TimeframeSchema } from "../enums";

export const DatasetSchema = z.object({
  id: z.number().int().positive(),
  instrument_id: z.number().int().positive(),
  timeframe: TimeframeSchema,
  uploaded_by_user_id: z.number().int().positive(),
  uploaded_at: z.iso.datetime().optional(),
  records_count: z.number().int().nonnegative().optional(),
  file_name: z.string().optional(),
  is_active: z.boolean().default(false),
  start_ts: z.iso.datetime().optional(),
  end_ts: z.iso.datetime().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Dataset = z.infer<typeof DatasetSchema>;
