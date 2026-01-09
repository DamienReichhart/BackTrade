import { z } from "zod";
import { TimeframeSchema } from "../enums";

/**
 * Coerce value to number, handling Decimal objects, strings, and numbers.
 * ClickHouse's Decimal64 type may be serialized as a string,
 * so we need to coerce it back to a number for frontend consumption.
 */
const numberCoerce = z.coerce.number();

/**
 * Candle entity schema with proper handling for:
 * - ClickHouse Decimal64 fields (coerced to number)
 */
export const CandleSchema = z.object({
    instrument_id: numberCoerce.int().positive(),
    timeframe: TimeframeSchema,
    ts: z.iso.datetime(),
    open: numberCoerce.positive(),
    high: numberCoerce.positive(),
    low: numberCoerce.positive(),
    close: numberCoerce.positive(),
    volume: numberCoerce.nonnegative(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
});
export type Candle = z.infer<typeof CandleSchema>;
