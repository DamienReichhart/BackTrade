import { z } from "zod";
import { SessionStatusSchema, SpeedSchema, LeverageSchema } from "../enums";

/**
 * Coerce value to number, handling Prisma Decimal objects, strings, and numbers
 */
const numberCoerce = z.coerce.number();

export const SessionSchema = z.object({
    id: numberCoerce.int().positive(),
    user_id: numberCoerce.int().positive(),
    instrument_id: numberCoerce.int().positive(),
    name: z.string().optional(),
    session_status: SessionStatusSchema,
    speed: SpeedSchema,
    start_time: z.iso.datetime(),
    current_time: z.iso.datetime(),
    end_time: z.iso.datetime().nullable().optional(),
    initial_balance: numberCoerce.positive(),
    current_balance: numberCoerce.nonnegative(),
    leverage: numberCoerce.pipe(LeverageSchema),
    spread_pts: numberCoerce.nonnegative(),
    slippage_pts: numberCoerce.nonnegative(),
    commission_per_fill: numberCoerce.nonnegative(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
});
export type Session = z.infer<typeof SessionSchema>;
