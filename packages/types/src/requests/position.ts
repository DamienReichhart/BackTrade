import { z } from "zod";
import { PositionSchema } from "../entities";
import { SideSchema, PositionStatusSchema } from "../enums";

export const CreatePositionRequestSchema = z.object({
  session_id: z.number().int().positive(),
  side: SideSchema,
  entry_price: z.number().positive(),
  quantity_lots: z.number().positive(),
  tp_price: z.number().positive().optional(),
  sl_price: z.number().positive().optional(),
  position_status: PositionStatusSchema,
  opened_at: z.iso.datetime(),
});
export type CreatePositionRequest = z.infer<typeof CreatePositionRequestSchema>;

export const UpdatePositionRequestSchema = z.object({
  position_status: PositionStatusSchema.optional(),
  exit_price: z.number().positive().optional(),
  closed_at: z.iso.datetime().optional(),
  realized_pnl: z.number().optional(),
  commission_cost: z.number().nonnegative().optional(),
  slippage_cost: z.number().nonnegative().optional(),
  spread_cost: z.number().nonnegative().optional(),
});
export type UpdatePositionRequest = z.infer<typeof UpdatePositionRequestSchema>;

/**
 * Response schema for create position operation.
 * Makes the fields optional since they may not be present immediately after creation.
 */
export const CreatePositionResponseSchema = PositionSchema.partial({
  position_status: true,
  opened_at: true,
  realized_pnl: true,
  commission_cost: true,
  slippage_cost: true,
  spread_cost: true,
  created_at: true,
  updated_at: true,
  closed_at: true,
  exit_price: true,
}).passthrough();
export type CreatePositionResponse = z.infer<
  typeof CreatePositionResponseSchema
>;

export const ClosePositionRequestSchema = z.object({
  position_status: PositionStatusSchema,
  exit_price: z.number().positive(),
  closed_at: z.iso.datetime(),
});
export type ClosePositionRequest = z.infer<typeof ClosePositionRequestSchema>;

/**
 * Schema for position items in list responses.
 * Makes computed fields optional since the backend may not always include them.
 */
export const PositionListItemSchema = PositionSchema.partial({
  realized_pnl: true,
  commission_cost: true,
  slippage_cost: true,
  spread_cost: true,
  created_at: true,
  updated_at: true,
  closed_at: true,
  exit_price: true,
  tp_price: true,
  sl_price: true,
}).passthrough();
export type PositionListItem = z.infer<typeof PositionListItemSchema>;

export const PositionListResponseSchema = z.array(PositionListItemSchema);
export type PositionListResponse = z.infer<typeof PositionListResponseSchema>;
