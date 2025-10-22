import { EnvSchema } from "@backtrade/types";

/**
 * Configuration for the Web application
 * Loads environment variables from .env.development or .env.production via Vite
 * Vite automatically loads the appropriate .env file based on the mode
 * Note: Vite only exposes variables prefixed with VITE_ to the client
 */
export const env = EnvSchema.parse({
  NODE_ENV:
    import.meta.env.VITE_MODE === "development" ? "development" : "production",
  VITE_API_URL: import.meta.env.VITE_API_URL,
});
