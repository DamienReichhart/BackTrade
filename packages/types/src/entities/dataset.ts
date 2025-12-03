import { z } from "zod";
import { TimeframeSchema } from "../enums";

export const DatasetSchema = z.object({
    id: z.number().int().positive(),
    instrument_id: z.number().int().positive(),
    timeframe: TimeframeSchema,
    uploaded_at: z.iso.datetime().optional(),
    records_count: z.number().int().nonnegative().optional(),
    file_name: z.string().optional(),
    start_time: z.iso.datetime().optional(),
    end_time: z.iso.datetime().optional(),
    created_at: z.string().optional(), // optional only for the front only, will be required when backend is impelemnted
    updated_at: z.string().optional(),
});
export type Dataset = z.infer<typeof DatasetSchema>;
