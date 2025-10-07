import "dotenv/config";
import { EnvSchema } from "@backtrade/types";

export const env = EnvSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  VITE_API_URL: process.env.VITE_API_URL,
});
