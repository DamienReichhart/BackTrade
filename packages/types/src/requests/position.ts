import { z } from "zod";
import { PositionSchema } from "../entities";
import { SideSchema, PositionStatusSchema } from "../enums";

/**
 * Schema for creating a new position.
 *
 * Request fields use strict number validation (frontend sends proper numbers).
 * Optional fields like tp_price and sl_price are truly optional (omitted when not set).
 */
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

/**
 * Schema for updating an existing position.
 *
 * All fields are optional since updates can be partial.
 * tp_price and sl_price accept null to allow clearing these values.
 */
export const UpdatePositionRequestSchema = z.object({
    position_status: PositionStatusSchema.optional(),
    exit_price: z.number().positive().optional(),
    closed_at: z.iso.datetime().optional(),
    realized_pnl: z.number().optional(),
    commission_cost: z.number().nonnegative().optional(),
    slippage_cost: z.number().nonnegative().optional(),
    spread_cost: z.number().nonnegative().optional(),
    tp_price: z.number().positive().nullable().optional(),
    sl_price: z.number().positive().nullable().optional(),
});
export type UpdatePositionRequest = z.infer<typeof UpdatePositionRequestSchema>;

/**
 * Response schema for create position operation.
 *
 * Uses the base PositionSchema which already handles:
 * - Prisma Decimal to number coercion
 * - Nullable fields for database null values
 *
 * Makes certain fields optional since they may not be present immediately after creation.
 */
export const CreatePositionResponseSchema = PositionSchema.partial({
    created_at: true,
    updated_at: true,
});
export type CreatePositionResponse = z.infer<
    typeof CreatePositionResponseSchema
>;

/**
 * Schema for closing a position.
 *
 * Requires exit_price and closed_at timestamp.
 */
export const ClosePositionRequestSchema = z.object({
    position_status: PositionStatusSchema,
    exit_price: z.number().positive(),
    closed_at: z.iso.datetime(),
});
export type ClosePositionRequest = z.infer<typeof ClosePositionRequestSchema>;

/**
 * Schema for position items in list responses.
 *
 * Uses the base PositionSchema which handles all type coercion and nullable fields.
 * Makes timestamp fields optional since the backend may not always include them.
 */
export const PositionListItemSchema = PositionSchema.partial({
    created_at: true,
    updated_at: true,
});
export type PositionListItem = z.infer<typeof PositionListItemSchema>;

/**
 * Schema for position list responses.
 */
export const PositionListResponseSchema = z.array(PositionListItemSchema);
export type PositionListResponse = z.infer<typeof PositionListResponseSchema>;
