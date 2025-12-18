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
    SCHEDULER_LOG_LEVEL: LOG_LEVELS.default("info"),
    SCHEDULER_LOG_DIR: z.string().default("."),
    DATABASE_URL: z.string(),
    RABBITMQ_HOST: z.string(),
    RABBITMQ_PORT: z.coerce.number().int().positive(),
    RABBITMQ_USER: z.string(),
    RABBITMQ_PASSWORD: z.string(),
    RABBITMQ_QUEUE_NAME: z.string(),
    // Retry configuration
    QUEUE_RETRY_ENABLED: z
        .string()
        .default("true")
        .transform((val) => val === "true"),
    QUEUE_RETRY_CRON: z.string().default("*/30 * * * * *"), // Every 30 seconds
    QUEUE_RETRY_BATCH_SIZE: z.coerce.number().int().positive().default(10),
    QUEUE_RETRY_INITIAL_BACKOFF_MS: z.coerce
        .number()
        .int()
        .positive()
        .default(1000),
    QUEUE_RETRY_BACKOFF_MULTIPLIER: z.coerce.number().positive().default(2.0),
    QUEUE_RETRY_MAX_RETRIES: z.coerce.number().int().nonnegative().default(5),
    QUEUE_RETRY_MAX_BACKOFF_MS: z.coerce
        .number()
        .int()
        .positive()
        .default(300000), // 5 minutes
});

export const ENV = EnvSchema.parse(process.env);
