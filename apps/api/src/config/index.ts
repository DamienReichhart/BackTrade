import "dotenv/config";
import { EnvSchema } from "@backtrade/types";

/**
 * Configuration for the API application
 * Loads environment variables from .env.development or .env.production based on NODE_ENV
 */
export const env = EnvSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  HOST: process.env.HOST,
});
