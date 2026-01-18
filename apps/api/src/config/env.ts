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
const NODE_ENVS = z.enum(["development", "production", "test"]);

const EnvSchema = z.object({
    API_HOST: z.string(),
    API_PORT: z.coerce.number().int().positive(),
    DATABASE_URL: z.string(),
    NODE_ENV: NODE_ENVS,
    REDIS_HOST: z.string(),
    REDIS_PORT: z.coerce.number().int().positive(),
    REDIS_PASSWORD: z.string(),
    API_LOG_LEVEL: LOG_LEVELS,
    API_LOG_DIR: z.string().default("."),
    ACCESS_TOKEN_SECRET: z.string(),
    REFRESH_TOKEN_SECRET: z.string(),
    ACCESS_TOKEN_EXPIRATION: z.string(),
    REFRESH_TOKEN_EXPIRATION: z.string(),
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
    MINIO_HOST: z.string(),
    MINIO_PORT: z.coerce.number().int().positive(),
    MINIO_USER: z.string(),
    MINIO_PASSWORD: z.string(),
    MINIO_CA_CERT_PATH: z.string().optional(),
    MINIO_DATASETS_BUCKET: z.string().default("datasets"),
    RABBITMQ_HOST: z.string(),
    RABBITMQ_PORT: z.coerce.number().int().positive(),
    RABBITMQ_USER: z.string(),
    RABBITMQ_PASSWORD: z.string(),
    RABBITMQ_QUEUE_NAME: z.string(),
    STRIPE_SECRET_KEY: z.string().startsWith("sk_"),
    STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_"),
    STRIPE_PUBLISHABLE_KEY: z.string().startsWith("pk_"),
});

export const ENV = EnvSchema.parse(process.env);
