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
});

export const ENV = EnvSchema.parse(process.env);
