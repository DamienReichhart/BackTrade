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
    SMTP_HOST: z.string(),
    SMTP_PORT: z.coerce.number().int().positive(),
    SMTP_USER: z.string(),
    SMTP_PASSWORD: z.string(),
    SMTP_FROM: z.string(),
    FRONTEND_URL: z.string().url(),
    NEUTRALIZE_EMAIL: z
        .string()
        .default("false")
        .transform((val) => val === "true"),
    // S3 (RustFS) configuration for storage operations
    S3_HOST: z.string(),
    S3_PORT: z.coerce.number().int().positive(),
    S3_ACCESS_KEY_ID: z.string(),
    S3_SECRET_ACCESS_KEY: z.string(),
    S3_REGION: z.string().default("us-east-1"),
});

export const ENV = EnvSchema.parse(process.env);
