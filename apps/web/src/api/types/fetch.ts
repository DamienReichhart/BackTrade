import type { z } from "zod";
import type { UseQueryOptions } from "@tanstack/react-query";

export interface fetchOptions<TInput = unknown, TOutput = unknown> {
  /** HTTP method */
  method?: "GET" | "POST" | "PUT" | "DELETE";
  /** Zod schema to validate request body before sending */
  inputSchema?: z.ZodType<TInput>;
  /** Zod schema to validate response data after receiving */
  outputSchema?: z.ZodType<TOutput>;
  /** Additional fetch options */
  fetchOptions?: Omit<RequestInit, "body" | "method">;
  /** React Query options (for GET only). Use `enabled` to control auto-fetch behavior */
  queryOptions?: Omit<UseQueryOptions<TOutput, Error>, "queryKey" | "queryFn">;
}

export interface FetchExecutorOptions<TInput, TOutput> {
  /** HTTP method */
  method: string;
  /** API endpoint URL (relative to API_BASE_URL) */
  url: string;
  /** Zod schema to validate request body before sending */
  inputSchema?: z.ZodType<TInput>;
  /** Zod schema to validate response data after receiving */
  outputSchema?: z.ZodType<TOutput>;
  /** Additional fetch options */
  fetchOptions?: Omit<RequestInit, "body" | "method">;
  /** Current access token for authorization */
  accessToken?: string;
  /** Current refresh token for token refresh */
  refreshToken?: string;
  /** Callback to update tokens after refresh */
  onTokenRefresh?: (accessToken: string, refreshToken: string) => void;
}
