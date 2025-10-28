import { z } from "zod";
import { SessionSchema } from "../entities";
import { TimeframeSchema, SpeedSchema, SessionStatusSchema } from "../enums";

export const CreateSessionRequestSchema = z.object({
  instrument_id: z.number().int().positive(),
  name: z.string().optional(),
  timeframe: TimeframeSchema,
  speed: SpeedSchema,
  start_ts: z.iso.datetime(),
  end_ts: z.iso.datetime().optional(),
  initial_balance: z.number().positive(),
  leverage: z.number().positive(),
  spread_pts: z.number().int().nonnegative(),
  slippage_pts: z.number().int().nonnegative(),
  commission_per_fill: z.number().nonnegative(),
});
export type CreateSessionRequest = z.infer<typeof CreateSessionRequestSchema>;

export const UpdateSessionRequestSchema = z.object({
  name: z.string().optional(),
  session_status: SessionStatusSchema.optional(),
  speed: SpeedSchema.optional(),
  end_ts: z.iso.datetime().optional(),
});
export type UpdateSessionRequest = z.infer<typeof UpdateSessionRequestSchema>;

export const SessionListResponseSchema = z.array(SessionSchema);
export type SessionListResponse = z.infer<typeof SessionListResponseSchema>;
