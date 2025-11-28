import "dotenv/config";
import { z } from "zod";

const EnvSchema = z.object({
    HOST: z.string(),
    PORT: z.coerce.number().int().positive(),
    DATABASE_URL: z.string(),
    NODE_ENV: z.enum(["development", "production", "test"]),
    REDIS_HOST: z.string(),
    REDIS_PORT: z.coerce.number().int().positive(),
    REDIS_PASSWORD: z.string(),
    LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]),
    LOG_DIR: z.string().default("."),
});

export const ENV = EnvSchema.parse(process.env);