import { z } from "zod";
import { TransactionTypeSchema } from "../enums";

export const TransactionSchema = z.object({
  id: z.number().int().positive(),
  session_id: z.number().int().positive().optional(),
  transaction_type: TransactionTypeSchema,
  amount: z.number(),
  balance_after: z.number(),
  created_at: z.string().optional(), // optional only for the front only, will be required when backend is impelemnted
  updated_at: z.string().optional(),
});
export type Transaction = z.infer<typeof TransactionSchema>;
