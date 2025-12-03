import { z } from "zod";

export const PlanSchema = z.object({
    id: z.number().int().positive(),
    code: z.string(),
    stripe_product_id: z.string(),
    stripe_price_id: z.string(),
    currency: z.string().length(3),
    price: z.number().nonnegative(),
    created_at: z.string().optional(), // optional only for the front only, will be required when backend is impelemnted
    updated_at: z.string().optional(),
});
export type Plan = z.infer<typeof PlanSchema>;
