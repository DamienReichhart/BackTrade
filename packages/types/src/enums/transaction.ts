import { z } from "zod";

export const TransactionTypeSchema = z.enum([
  "DEPOSIT",
  "WITHDRAWAL",
  "COMMISSION",
  "PNL",
  "SLIPPAGE",
  "SPREAD",
  "ADJUSTMENT",
]);
export type TransactionType = z.infer<typeof TransactionTypeSchema>;
