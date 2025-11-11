import { useAuthStore } from "../../../context/AuthContext";
import { executeFetch } from "../../utils/fetchExecutor";
import { useQueryAndMutation } from "./useQueryAndMutation";
import type { UseFetchOptions } from "../../types";

/**
 * Unified GET/POST/PUT/DELETE hook built on React Query
 *
 * @param url - API endpoint URL (relative to API_BASE_URL)
 * @param options - Configuration options
 */
export function useFetch<TOutput = unknown, TInput = unknown>(
  url: string,
  {
    method = "GET",
    inputSchema,
    outputSchema,
    requestInit = {},
    queryOptions = {},
  }: UseFetchOptions<TInput, TOutput> = {},
) {
  const isQuery = method === "GET";
  const { accessToken, refreshToken, login } = useAuthStore();

  // Set up React Query hooks with the fetch executor
  const { query, mutation, execute } = useQueryAndMutation<TInput, TOutput>({
    method,
    url,
    isQuery,
    queryOptions,
    fetcher: executeFetch,
    executorConfig: {
      method,
      url,
      inputSchema,
      outputSchema,
      requestInit,
      accessToken,
      refreshToken,
      onTokenRefresh: login,
    },
  });

  // Return consistent object shape for all methods
  if (isQuery) {
    return {
      data: query.data ?? null,
      error: query.error ?? null,
      isLoading: query.isLoading || query.isFetching,
      isSuccess: query.isSuccess,
      execute,
    };
  }

  return {
    data: mutation.data ?? null,
    error: mutation.error ?? null,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    execute,
  };
}
