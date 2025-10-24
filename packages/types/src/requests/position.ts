import { z } from "zod";
import { PositionSchema } from "../entities";
import { SideSchema, PositionStatusSchema } from "../enums";

export const CreatePositionRequestSchema = z.object({
  session_id: z.number().int().positive(),
  candle_id: z.number().int().positive(),
  side: SideSchema,
  entry_price: z.number().positive(),
  quantity_lots: z.number().positive(),
  tp_price: z.number().positive().optional(),
  sl_price: z.number().positive().optional(),
});
export type CreatePositionRequest = z.infer<typeof CreatePositionRequestSchema>;

export const UpdatePositionRequestSchema = z.object({
  position_status: PositionStatusSchema.optional(),
  exit_candle_id: z.number().int().positive().optional(),
  exit_price: z.number().positive().optional(),
  closed_at: z.iso.datetime().optional(),
  realized_pnl: z.number().optional(),
  commission_cost: z.number().nonnegative().optional(),
  slippage_cost: z.number().nonnegative().optional(),
  spread_cost: z.number().nonnegative().optional(),
});
export type UpdatePositionRequest = z.infer<typeof UpdatePositionRequestSchema>;

export const PositionListResponseSchema = z.object({
  positions: z.array(PositionSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
});
export type PositionListResponse = z.infer<typeof PositionListResponseSchema>;
