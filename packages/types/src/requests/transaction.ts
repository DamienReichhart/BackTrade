import { z } from "zod";
import { TransactionSchema } from "../entities";
import { TransactionTypeSchema } from "../enums";

export const CreateTransactionRequestSchema = z.object({
  session_id: z.number().int().positive().optional(),
  transaction_type: TransactionTypeSchema,
  amount: z.number(),
  balance_after: z.number(),
});
export type CreateTransactionRequest = z.infer<
  typeof CreateTransactionRequestSchema
>;

export const TransactionListResponseSchema = z.array(TransactionSchema);
export type TransactionListResponse = z.infer<
  typeof TransactionListResponseSchema
>;
