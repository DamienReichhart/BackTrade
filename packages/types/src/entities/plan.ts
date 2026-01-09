import { z } from "zod";

/**
 * Coerce value to number, handling Prisma Decimal objects, strings, and numbers.
 * Prisma's Decimal type is serialized as a string by JSON.stringify(),
 * so we need to coerce it back to a number for frontend consumption.
 */
const numberCoerce = z.coerce.number();

/**
 * Plan entity schema with proper handling for Prisma Decimal fields.
 */
export const PlanSchema = z.object({
    id: numberCoerce.int().positive(),
    code: z.string(),
    stripe_product_id: z.string(),
    stripe_price_id: z.string(),
    currency: z.string().length(3),
    price: numberCoerce.nonnegative(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
});
export type Plan = z.infer<typeof PlanSchema>;
