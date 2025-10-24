import { z } from "zod";
import { TimeframeSchema } from "../enums";

export const CandleSchema = z.object({
  id: z.number().int().positive(),
  instrument_id: z.number().int().positive(),
  timeframe: TimeframeSchema,
  ts: z.iso.datetime(),
  open: z.number().positive(),
  high: z.number().positive(),
  low: z.number().positive(),
  close: z.number().positive(),
  volume: z.number().nonnegative(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Candle = z.infer<typeof CandleSchema>;
