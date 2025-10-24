import { z } from "zod";
import { InstrumentSchema } from "../entities";

export const CreateInstrumentRequestSchema = z.object({
  symbol: z.string(),
  display_name: z.string(),
  pip_size: z.number().positive(),
  enabled: z.boolean().default(true),
});
export type CreateInstrumentRequest = z.infer<
  typeof CreateInstrumentRequestSchema
>;

export const UpdateInstrumentRequestSchema = z.object({
  display_name: z.string().optional(),
  pip_size: z.number().positive().optional(),
  enabled: z.boolean().optional(),
});
export type UpdateInstrumentRequest = z.infer<
  typeof UpdateInstrumentRequestSchema
>;

export const InstrumentListResponseSchema = z.object({
  instruments: z.array(InstrumentSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
});
export type InstrumentListResponse = z.infer<
  typeof InstrumentListResponseSchema
>;
