import "dotenv/config";
import { z } from "zod";

const LOG_LEVELS = z.enum([
    "fatal",
    "error",
    "warn",
    "info",
    "debug",
    "trace",
    "silent",
]);

const EnvSchema = z.object({
    NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("development"),
    WORKER_LOG_LEVEL: LOG_LEVELS.default("info"),
    WORKER_LOG_DIR: z.string().default("."),
    RABBITMQ_HOST: z.string(),
    RABBITMQ_PORT: z.coerce.number().int().positive(),
    RABBITMQ_USER: z.string(),
    RABBITMQ_PASSWORD: z.string(),
    RABBITMQ_QUEUE_NAME: z.string(),
});

export const ENV = EnvSchema.parse(process.env);
