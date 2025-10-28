import { z } from "zod";
import { TimeframeSchema, SessionStatusSchema, SpeedSchema } from "../enums";

export const SessionSchema = z.object({
  id: z.number().int().positive(),
  user_id: z.number().int().positive(),
  instrument_id: z.number().int().positive(),
  name: z.string().optional(),
  timeframe: TimeframeSchema,
  session_status: SessionStatusSchema,
  speed: SpeedSchema,
  start_ts: z.iso.datetime(),
  end_ts: z.iso.datetime().nullable().optional(),
  initial_balance: z.number().positive(),
  leverage: z.number().positive(),
  spread_pts: z.number().nonnegative(),
  slippage_pts: z.number().nonnegative(),
  commission_per_fill: z.number().nonnegative(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Session = z.infer<typeof SessionSchema>;
