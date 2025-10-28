import { z } from "zod";
import { TransactionTypeSchema } from "../enums";

export const TransactionSchema = z.object({
  id: z.number().int().positive(),
  user_id: z.number().int().positive(),
  session_id: z.number().int().positive().optional(),
  position_id: z.number().int().positive().optional(),
  transaction_type: TransactionTypeSchema,
  amount: z.number(),
  balance_after: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Transaction = z.infer<typeof TransactionSchema>;
