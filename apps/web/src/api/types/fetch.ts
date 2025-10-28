import type { z } from "zod";
import type { UseQueryOptions } from "@tanstack/react-query";

export interface fetchOptions<TInput = unknown, TOutput = unknown> {
  /** HTTP method */
  method?: "GET" | "POST" | "PUT" | "DELETE";
  /** Zod schema to validate request body before sending */
  inputSchema?: z.ZodType<TInput>;
  /** Zod schema to validate response data after receiving */
  outputSchema?: z.ZodType<TOutput>;
  /** For GET requests: automatically fetch on mount */
  autoFetch?: boolean;
  /** Additional fetch options */
  fetchOptions?: Omit<RequestInit, "body" | "method">;
  /** React Query options (for GET only) */
  queryOptions?: Omit<
    UseQueryOptions<TOutput, Error>,
    "queryKey" | "queryFn" | "enabled"
  >;
}
