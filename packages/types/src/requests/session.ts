import { z } from "zod";
import { SessionSchema } from "../entities";
import { SpeedSchema, SessionStatusSchema, LeverageSchema } from "../enums";

export const CreateSessionRequestSchema = z.object({
  instrument_id: z.number().int().positive(),
  name: z.string().optional(),
  speed: SpeedSchema,
  start_ts: z.iso.datetime(),
  current_ts: z.iso.datetime(),
  end_ts: z.iso.datetime().optional(),
  initial_balance: z.number().positive(),
  leverage: LeverageSchema,
  spread_pts: z.number().int().nonnegative(),
  slippage_pts: z.number().int().nonnegative(),
  commission_per_fill: z.number().nonnegative(),
  user_id: z.number().int().positive(),
  session_status: SessionStatusSchema,
  created_at: z.string(),
  updated_at: z.string(),
});
export type CreateSessionRequest = z.infer<typeof CreateSessionRequestSchema>;

export const UpdateSessionRequestSchema = z.object({
  name: z.string().optional(),
  session_status: SessionStatusSchema.optional(),
  speed: SpeedSchema.optional(),
  current_ts: z.iso.datetime().optional(),
  end_ts: z.iso.datetime().optional(),
});
export type UpdateSessionRequest = z.infer<typeof UpdateSessionRequestSchema>;

export const SessionListResponseSchema = z.array(SessionSchema);
export type SessionListResponse = z.infer<typeof SessionListResponseSchema>;

export const SessionInfoResponseSchema = z.object({
  start_balance: z.number().nonnegative(),
  current_equity: z.number().nonnegative(),
  drawdown: z.number().nonnegative(),
  win_rate: z.number().nonnegative(),
  leverage: LeverageSchema,
  margin_level: z.number().nonnegative(),
});
export type SessionInfoResponse = z.infer<typeof SessionInfoResponseSchema>;
