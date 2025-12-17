import { z } from "zod";

const EnvSchema = z.object({
    REDIS_HOST: z.string(),
    REDIS_PORT: z.coerce.number().int().positive(),
    REDIS_PASSWORD: z.string(),
});

export const ENV = EnvSchema.parse(process.env);
