import { z } from "zod";
import { numberCoerce } from "./coerce";

/**
 * Instrument entity schema with proper handling for:
 * - Prisma Decimal fields (coerced to number)
 */
export const InstrumentSchema = z.object({
    id: numberCoerce.int().positive(),
    symbol: z.string(),
    display_name: z.string(),
    pip_size: numberCoerce.positive(),
    contract_size: numberCoerce.int().positive().default(100000),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
});
export type Instrument = z.infer<typeof InstrumentSchema>;
