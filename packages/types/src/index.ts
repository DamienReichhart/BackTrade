import { z } from "zod";

// Re-export all schemas and types from modular structure
export * from "./enums";
export * from "./entities";
export * from "./requests";

// Legacy schemas (keeping for backward compatibility)
export const HealthSchema = z.object({
    status: z.literal("ok"),
    time: z.iso.datetime(),
    database: z.enum(["connected", "error"]),
    redis: z.enum(["connected", "error"]),
});
export type Health = z.infer<typeof HealthSchema>;

export const HealthResponseSchema = HealthSchema;
