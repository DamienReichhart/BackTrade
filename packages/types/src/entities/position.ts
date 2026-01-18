import { z } from "zod";
import { PositionStatusSchema, SideSchema } from "../enums";
import { numberCoerce, nullableNumberCoerce } from "./coerce";

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
    realized_pnl: nullableNumberCoerce,
    unrealized_pnl: nullableNumberCoerce,
    commission_cost: numberCoerce.nonnegative().nullable(),
    slippage_cost: numberCoerce.nonnegative().nullable(),
    spread_cost: numberCoerce.nonnegative().nullable(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
});
export type Position = z.infer<typeof PositionSchema>;
