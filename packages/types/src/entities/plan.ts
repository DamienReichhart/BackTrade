import { z } from "zod";
import { numberCoerce } from "./coerce";

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
    max_active_sessions: z.number().int().positive(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
});
export type Plan = z.infer<typeof PlanSchema>;
