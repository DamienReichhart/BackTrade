import { z } from "zod";
import { TransactionSchema } from "../entities";
import { TransactionTypeSchema } from "../enums";

export const CreateTransactionRequestSchema = z.object({
  user_id: z.number().int().positive(),
  session_id: z.number().int().positive().optional(),
  position_id: z.number().int().positive().optional(),
  transaction_type: TransactionTypeSchema,
  amount: z.number(),
  balance_after: z.number(),
});
export type CreateTransactionRequest = z.infer<
  typeof CreateTransactionRequestSchema
>;

export const TransactionListResponseSchema = z.object({
  transactions: z.array(TransactionSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
});
export type TransactionListResponse = z.infer<
  typeof TransactionListResponseSchema
>;
