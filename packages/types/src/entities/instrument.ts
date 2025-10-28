import { z } from "zod";

export const InstrumentSchema = z.object({
  id: z.number().int().positive(),
  symbol: z.string(),
  display_name: z.string(),
  pip_size: z.number().positive(),
  enabled: z.boolean().default(true),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Instrument = z.infer<typeof InstrumentSchema>;
