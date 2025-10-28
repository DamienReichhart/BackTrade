import { z } from "zod";

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
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  ...PaginationQuerySchema.shape,
});
export type DateRangeQuery = z.infer<typeof DateRangeQuerySchema>;
