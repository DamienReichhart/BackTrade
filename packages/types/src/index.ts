import { z } from "zod";

export const HealthSchema = z.object({
  status: z.literal("ok"),
  time: z.string(),
});
export type Health = z.infer<typeof HealthSchema>;

export const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  VITE_API_URL: z.string().url().optional(),
});
export type Env = z.infer<typeof EnvSchema>;
