import { z } from "zod";

export const InstrumentSchema = z.object({
  id: z.number().int().positive(),
  symbol: z.string(),
  display_name: z.string(),
  pip_size: z.number().positive(),
  created_at: z.string().optional(), // optional only for the front only, will be required when backend is impelemnted
  updated_at: z.string().optional(),
});
export type Instrument = z.infer<typeof InstrumentSchema>;
