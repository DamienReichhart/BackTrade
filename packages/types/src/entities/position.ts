import { z } from "zod";
import { PositionStatusSchema, SideSchema } from "../enums";

export const PositionSchema = z.object({
  id: z.number().int().positive(),
  session_id: z.number().int().positive(),
  position_status: PositionStatusSchema,
  side: SideSchema,
  quantity_lots: z.number().positive(),
  tp_price: z.number().positive().optional(),
  sl_price: z.number().positive().optional(),
  entry_price: z.number().positive(),
  exit_price: z.number().positive().optional(),
  opened_at: z.iso.datetime(),
  closed_at: z.iso.datetime().optional(),
  realized_pnl: z.number().optional(),
  commission_cost: z.number().nonnegative().optional(),
  slippage_cost: z.number().nonnegative().optional(),
  spread_cost: z.number().nonnegative().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Position = z.infer<typeof PositionSchema>;
