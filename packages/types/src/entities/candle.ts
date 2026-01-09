import { z } from "zod";
import { TimeframeSchema } from "../enums";
import { numberCoerce } from "./coerce";

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
