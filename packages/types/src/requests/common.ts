import { z } from "zod";
import { RoleSchema } from "../enums";

export const PaginationQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    sort: z.string().optional(),
    order: z.enum(["asc", "desc"]).default("desc"),
});
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

export const SearchQuerySchema = z.object({
    q: z.string().optional(),
    ...PaginationQuerySchema.shape,
});
export type SearchQuery = z.infer<typeof SearchQuerySchema>;

export const DateRangeQuerySchema = z.object({
    ts_gte: z.string().optional(),
    ts_lte: z.string().optional(),
    ...PaginationQuerySchema.shape,
});
export type DateRangeQuery = z.infer<typeof DateRangeQuerySchema>;

export const SearchQueryUserSchema = z.object({
    q: z.string().optional(),
    role: RoleSchema.optional(),
    is_banned: z.boolean().optional(),
    ...PaginationQuerySchema.shape,
});
export type SearchQueryUser = z.infer<typeof SearchQueryUserSchema>;

/**
 * Empty response schema for DELETE operations
 * Represents a successful deletion with no response body
 */
export const EmptyResponseSchema = z.object({}).optional();
export type EmptyResponse = z.infer<typeof EmptyResponseSchema>;
