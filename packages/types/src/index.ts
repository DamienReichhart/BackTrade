import { z } from "zod";

// Re-export all schemas and types from modular structure
export * from "./enums";
export * from "./entities";
export * from "./requests";

// Legacy schemas (keeping for backward compatibility)
export const HealthSchema = z.object({
  status: z.literal("ok"),
  time: z.string(),
});
export type Health = z.infer<typeof HealthSchema>;