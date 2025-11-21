import { z } from "zod";
import { InstrumentSchema } from "../entities";

export const CreateInstrumentRequestSchema = z.object({
  symbol: z.string(),
  display_name: z.string(),
  pip_size: z.number().positive(),
});
export type CreateInstrumentRequest = z.infer<
  typeof CreateInstrumentRequestSchema
>;

export const UpdateInstrumentRequestSchema = z.object({
  display_name: z.string().optional(),
  pip_size: z.number().positive().optional(),
});
export type UpdateInstrumentRequest = z.infer<
  typeof UpdateInstrumentRequestSchema
>;

export const InstrumentListResponseSchema = z.array(InstrumentSchema);
export type InstrumentListResponse = z.infer<
  typeof InstrumentListResponseSchema
>;
