import { z } from "zod";
import { SessionStatusSchema, SpeedSchema, LeverageSchema } from "../enums";

export const SessionSchema = z.object({
  id: z.number().int().positive(),
  user_id: z.number().int().positive(),
  instrument_id: z.number().int().positive(),
  name: z.string().optional(),
  session_status: SessionStatusSchema,
  speed: SpeedSchema,
  start_ts: z.iso.datetime(),
  current_ts: z.iso.datetime(),
  end_ts: z.iso.datetime().nullable().optional(),
  initial_balance: z.number().positive(),
  leverage: LeverageSchema,
  spread_pts: z.number().nonnegative(),
  slippage_pts: z.number().nonnegative(),
  commission_per_fill: z.number().nonnegative(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Session = z.infer<typeof SessionSchema>;
