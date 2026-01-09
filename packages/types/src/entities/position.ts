import { z } from "zod";
import { PositionStatusSchema, SideSchema } from "../enums";

/**
 * Coerce value to number, handling Prisma Decimal objects, strings, and numbers.
 * Prisma's Decimal type is serialized as a string by JSON.stringify(),
 * so we need to coerce it back to a number for frontend consumption.
 */
const numberCoerce = z.coerce.number();

/**
 * Position entity schema with proper handling for:
 * - Prisma Decimal fields (coerced to number)
 * - Nullable database fields (using .nullable())
 */
export const PositionSchema = z.object({
    id: numberCoerce.int().positive(),
    session_id: numberCoerce.int().positive(),
    position_status: PositionStatusSchema,
    side: SideSchema,
    quantity_lots: numberCoerce.positive(),
    tp_price: numberCoerce.positive().nullable(),
    sl_price: numberCoerce.positive().nullable(),
    entry_price: numberCoerce.positive(),
    exit_price: numberCoerce.positive().nullable(),
    opened_at: z.iso.datetime(),
    closed_at: z.iso.datetime().nullable(),
    realized_pnl: numberCoerce.nullable(),
    commission_cost: numberCoerce.nonnegative().nullable(),
    slippage_cost: numberCoerce.nonnegative().nullable(),
    spread_cost: numberCoerce.nonnegative().nullable(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
});
export type Position = z.infer<typeof PositionSchema>;
