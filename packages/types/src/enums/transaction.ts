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

/**
 * Get all TransactionType enum values as an array
 */
export const TRANSACTION_TYPE_VALUES: TransactionType[] = [
    "DEPOSIT",
    "WITHDRAWAL",
    "COMMISSION",
    "PNL",
    "SLIPPAGE",
    "SPREAD",
    "ADJUSTMENT",
];
