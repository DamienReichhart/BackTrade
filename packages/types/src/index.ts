import { z } from "zod";

// Re-export all schemas and types from modular structure
export * from "./enums";
export * from "./entities";
export * from "./requests";

export const SingleServiceHealthStatusSchema = z.enum(["ok", "error"]);
export type SingleServiceHealthStatus = z.infer<
    typeof SingleServiceHealthStatusSchema
>;

// Legacy schemas (keeping for backward compatibility)
export const HealthSchema = z.object({
    status: z.literal("ok"),
    time: z.iso.datetime(),
    database: SingleServiceHealthStatusSchema,
    redis: SingleServiceHealthStatusSchema,
    smtp: SingleServiceHealthStatusSchema,
});
export type Health = z.infer<typeof HealthSchema>;

export const HealthResponseSchema = HealthSchema;
