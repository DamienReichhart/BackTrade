import type { z } from "zod";
import type { UseQueryOptions } from "@tanstack/react-query";

/** HTTP request method type */
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface UseFetchOptions<TInput = unknown, TOutput = unknown> {
  /** HTTP method */
  method?: HttpMethod;
  /** Zod schema to validate request body before sending */
  inputSchema?: z.ZodType<TInput>;
  /** Zod schema to validate response data after receiving */
  outputSchema?: z.ZodType<TOutput>;
  /** Additional HTTP request options */
  requestInit?: Omit<RequestInit, "body" | "method">;
  /** React Query options. Use `enabled` to control auto-fetch behavior */
  queryOptions?: Omit<UseQueryOptions<TOutput, Error>, "queryKey" | "queryFn">;
}

export interface FetchExecutorConfig<TInput, TOutput> {
  /** HTTP method */
  method: HttpMethod;
  /** API endpoint URL (relative to API_BASE_URL) */
  url: string;
  /** Zod schema to validate request body before sending */
  inputSchema?: z.ZodType<TInput>;
  /** Zod schema to validate response data after receiving */
  outputSchema?: z.ZodType<TOutput>;
  /** Additional HTTP request options (RequestInit) */
  requestInit?: Omit<RequestInit, "body" | "method">;
  /** Current access token for authorization */
  accessToken?: string;
  /** Current refresh token for token refresh */
  refreshToken?: string;
  /** Callback to update tokens after refresh */
  onTokenRefresh?: (accessToken: string, refreshToken: string) => void;
}
