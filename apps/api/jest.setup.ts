/**
 * Jest environment bootstrap.
 *
 * Runs (via `setupFiles`) before any test module is imported, so it executes
 * before `src/config/env.ts` evaluates `EnvSchema.parse(process.env)` at import
 * time. Locally the values come from `apps/api/.env` (loaded by `dotenv/config`);
 * in CI no `.env` exists, so we provide schema-satisfying dummy defaults here.
 *
 * Each var is only set when absent, so a real environment is never overridden.
 */

const TEST_ENV: Record<string, string> = {
    API_HOST: "127.0.0.1",
    API_PORT: "21799",
    DATABASE_URL: "postgresql://test:test@127.0.0.1:5432/test",
    NODE_ENV: "test",
    REDIS_HOST: "127.0.0.1",
    REDIS_PORT: "6379",
    REDIS_PASSWORD: "test",
    API_LOG_LEVEL: "silent",
    ACCESS_TOKEN_SECRET: "test-access-token-secret",
    REFRESH_TOKEN_SECRET: "test-refresh-token-secret",
    ACCESS_TOKEN_EXPIRATION: "15m",
    REFRESH_TOKEN_EXPIRATION: "7d",
    SMTP_HOST: "127.0.0.1",
    SMTP_PORT: "1025",
    SMTP_USER: "test",
    SMTP_PASSWORD: "test",
    SMTP_FROM: "test@backtrade.test",
    FRONTEND_URL: "http://localhost:5173",
    S3_HOST: "127.0.0.1",
    S3_PORT: "9000",
    S3_ACCESS_KEY_ID: "test",
    S3_SECRET_ACCESS_KEY: "test",
    RABBITMQ_HOST: "127.0.0.1",
    RABBITMQ_PORT: "5672",
    RABBITMQ_USER: "test",
    RABBITMQ_PASSWORD: "test",
    RABBITMQ_QUEUE_NAME: "test",
    STRIPE_SECRET_KEY: "sk_test_dummy",
    STRIPE_WEBHOOK_SECRET: "whsec_test_dummy",
    STRIPE_PUBLISHABLE_KEY: "pk_test_dummy",
};

for (const [key, value] of Object.entries(TEST_ENV)) {
    process.env[key] ??= value;
}
