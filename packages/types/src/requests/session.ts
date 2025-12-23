import { z } from "zod";
import { SessionSchema } from "../entities";
import { SpeedSchema, SessionStatusSchema, LeverageSchema } from "../enums";

export const CreateSessionRequestSchema = z
    .object({
        instrument_id: z.number().int().positive(),
        name: z.string().optional(),
        speed: SpeedSchema,
        start_time: z.iso.datetime(),
        current_time: z.iso.datetime(),
        end_time: z.iso.datetime().optional(),
        initial_balance: z.number().positive(),
        leverage: LeverageSchema,
        spread_pts: z.number().int().nonnegative(),
        slippage_pts: z.number().int().nonnegative(),
        commission_per_fill: z.number().nonnegative(),
        session_status: SessionStatusSchema.optional(),
    })
    .refine(
        (data) => {
            // Validate that current_time equals start_time (business rule)
            return data.current_time === data.start_time;
        },
        {
            message: "current_time must equal start_time",
            path: ["current_time"],
        }
    )
    .refine(
        (data) => {
            // Validate that start_time <= end_time if end_time is provided
            if (data.end_time) {
                return new Date(data.start_time) <= new Date(data.end_time);
            }
            return true;
        },
        {
            message: "start_time must be less than or equal to end_time",
            path: ["end_time"],
        }
    );
export type CreateSessionRequest = z.infer<typeof CreateSessionRequestSchema>;

export const UpdateSessionRequestSchema = z.object({
    name: z.string().optional(),
    session_status: SessionStatusSchema.optional(),
    speed: SpeedSchema.optional(),
    current_time: z.iso.datetime().optional(),
    end_time: z.iso.datetime().optional(),
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
