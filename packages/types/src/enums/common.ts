import { z } from "zod";

/**
 * Sort order for data tables and lists
 */
export const SortOrderSchema = z.enum(["asc", "desc"]);
export type SortOrder = z.infer<typeof SortOrderSchema>;

/**
 * Node environment types
 */
export const NodeEnvSchema = z.enum(["development", "production", "test"]);
export type NodeEnv = z.infer<typeof NodeEnvSchema>;

/**
 * Log levels supported by the logger
 */
export const LogLevelSchema = z.enum([
    "fatal",
    "error",
    "warn",
    "info",
    "debug",
    "trace",
    "silent",
]);
export type LogLevel = z.infer<typeof LogLevelSchema>;
