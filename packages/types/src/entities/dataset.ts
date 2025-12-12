import { z } from "zod";
import { TimeframeSchema } from "../enums";

export const DatasetSchema = z.object({
    id: z.number().int().positive(),
    instrument_id: z.number().int().positive(),
    timeframe: TimeframeSchema,
    uploaded_at: z.iso.datetime().nullable(),
    records_count: z.number().int().nonnegative().nullable(),
    file_name: z.string().nullable(),
    start_time: z.iso.datetime().nullable(),
    end_time: z.iso.datetime().nullable(),
    created_at: z.string(),
    updated_at: z.string(),
});
export type Dataset = z.infer<typeof DatasetSchema>;
