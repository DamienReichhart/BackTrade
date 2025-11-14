import { z } from "zod";
import { TimeframeSchema } from "../enums";

export const DatasetSchema = z.object({
  id: z.number().int().positive(),
  instrument_id: z.number().int().positive(),
  timeframe: TimeframeSchema,
  uploaded_by_user_id: z.number().int().positive(),
  uploaded_at: z.iso.datetime(),
  records_count: z.number().int().nonnegative(),
  file_name: z.string(),
  file_size: z.string(),
  file_md5: z.string(),
  is_active: z.boolean().default(true),
  start_ts: z.iso.datetime(),
  end_ts: z.iso.datetime(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Dataset = z.infer<typeof DatasetSchema>;
