import { z } from "zod";
import { CandleSchema } from "../entities";
import { TimeframeSchema } from "../enums";

export const CreateCandleRequestSchema = z.object({
  instrument_id: z.number().int().positive(),
  timeframe: TimeframeSchema,
  ts: z.iso.datetime(),
  open: z.number().positive(),
  high: z.number().positive(),
  low: z.number().positive(),
  close: z.number().positive(),
  volume: z.number().nonnegative(),
});
export type CreateCandleRequest = z.infer<typeof CreateCandleRequestSchema>;

export const UpdateCandleRequestSchema = z.object({
  instrument_id: z.number().int().positive().optional(),
  timeframe: TimeframeSchema.optional(),
  timestamp: z.iso.datetime().optional(),
  open: z.number().optional(),
  high: z.number().optional(),
  low: z.number().optional(),
  close: z.number().optional(),
  volume: z.number().nonnegative().optional(),
});
export type UpdateCandleRequest = z.infer<typeof UpdateCandleRequestSchema>;

export const CandleListResponseSchema = z.array(CandleSchema);
export type CandleListResponse = z.infer<typeof CandleListResponseSchema>;

export const CreateCandlesRequestSchema = z.object({
  candles: z.array(CreateCandleRequestSchema).min(1),
});
export type CreateCandlesRequest = z.infer<typeof CreateCandlesRequestSchema>;
