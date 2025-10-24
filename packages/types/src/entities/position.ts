import { z } from "zod";
import { PositionStatusSchema, SideSchema } from "../enums";

export const PositionSchema = z.object({
  id: z.number().int().positive(),
  session_id: z.number().int().positive(),
  candle_id: z.number().int().positive(),
  exit_candle_id: z.number().int().positive().optional(),
  position_status: PositionStatusSchema,
  side: SideSchema,
  entry_price: z.number().positive(),
  quantity_lots: z.number().positive(),
  tp_price: z.number().positive().optional(),
  sl_price: z.number().positive().optional(),
  exit_price: z.number().positive().optional(),
  opened_at: z.iso.datetime(),
  closed_at: z.iso.datetime().optional(),
  realized_pnl: z.number(),
  commission_cost: z.number().nonnegative(),
  slippage_cost: z.number().nonnegative(),
  spread_cost: z.number().nonnegative(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Position = z.infer<typeof PositionSchema>;
