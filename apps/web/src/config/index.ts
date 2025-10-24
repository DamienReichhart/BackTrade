import { z } from "zod";

export const env = z.object({
  NODE_ENV:
    import.meta.env.VITE_MODE === "development" ? "development" : "production",
  VITE_API_URL: import.meta.env.VITE_API_URL,
});
