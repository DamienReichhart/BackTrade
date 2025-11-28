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
    LOG_LEVEL: z.enum(["FATAL", "ERROR", "WARN", "INFO", "DEBUG", "TRACE", "SILENT"]),
});

export const ENV = EnvSchema.parse(process.env);