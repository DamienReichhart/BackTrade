import { z } from "zod";
import { TimeframeSchema } from "../enums";
import { numberCoerce } from "./coerce";

/**
 * Dataset entity schema with proper handling for:
 * - Prisma numeric fields (coerced to number)
 * - Nullable database fields
 */
export const DatasetSchema = z.object({
    id: numberCoerce.int().positive(),
    instrument_id: numberCoerce.int().positive(),
    timeframe: TimeframeSchema,
    uploaded_at: z.iso.datetime().nullable(),
    records_count: numberCoerce.int().nonnegative().nullable(),
    file_name: z.string().nullable(),
    start_time: z.iso.datetime().nullable(),
    end_time: z.iso.datetime().nullable(),
    created_at: z.string(),
    updated_at: z.string(),
});
export type Dataset = z.infer<typeof DatasetSchema>;
