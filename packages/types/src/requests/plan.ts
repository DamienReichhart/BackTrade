import { z } from "zod";

export const CreatePlanRequestSchema = z.object({
  code: z.string().min(1),
  stripe_product_id: z.string().min(1),
  stripe_price_id: z.string().min(1),
  currency: z.string().length(3),
  price: z.number().nonnegative(),
});
export type CreatePlanRequest = z.infer<typeof CreatePlanRequestSchema>;

export const UpdatePlanRequestSchema = z.object({
  code: z.string().min(1).optional(),
  stripe_product_id: z.string().min(1).optional(),
  stripe_price_id: z.string().min(1).optional(),
  currency: z.string().length(3).optional(),
  price: z.number().nonnegative().optional(),
});
export type UpdatePlanRequest = z.infer<typeof UpdatePlanRequestSchema>;
