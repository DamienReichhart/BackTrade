import { z } from "zod";
import { TransactionTypeSchema } from "../enums";

/**
 * Coerce value to number, handling Prisma Decimal objects, strings, and numbers.
 * Prisma's Decimal type is serialized as a string by JSON.stringify(),
 * so we need to coerce it back to a number for frontend consumption.
 */
const numberCoerce = z.coerce.number();

/**
 * Transaction entity schema with proper handling for:
 * - Prisma Decimal fields (coerced to number)
 * - Nullable database fields (session_id can be null)
 */
export const TransactionSchema = z.object({
    id: numberCoerce.int().positive(),
    session_id: numberCoerce.int().positive().nullable(),
    transaction_type: TransactionTypeSchema,
    amount: numberCoerce,
    balance_after: numberCoerce,
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
});
export type Transaction = z.infer<typeof TransactionSchema>;
