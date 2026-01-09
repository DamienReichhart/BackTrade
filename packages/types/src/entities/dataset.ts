import { z } from "zod";
import { TimeframeSchema } from "../enums";

/**
 * Coerce value to number, handling Prisma Decimal objects, strings, and numbers.
 * Prisma's Decimal type is serialized as a string by JSON.stringify(),
 * so we need to coerce it back to a number for frontend consumption.
 */
const numberCoerce = z.coerce.number();

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
