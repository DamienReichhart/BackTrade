import { z } from "zod";

export const ErrorSchema = z.object({
  message: z.string(),
  code: z.number(),
});

export const ErrorResponseSchema = z.object({
  error: ErrorSchema,
});
