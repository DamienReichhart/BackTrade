import type { UseQueryOptions } from "@tanstack/react-query";
import type { executeFetch } from "../utils/fetchExecutor";
import type { FetchExecutorOptions } from ".";

export interface UseQueryAndMutationOptions<TInput, TOutput> {
  /** HTTP method */
  method: string;
  /** API endpoint URL for React Query key */
  url: string;
  /** Whether this is a GET request (query) or mutation */
  isQuery: boolean;
  /** React Query options (for queries only). Use `enabled` to control auto-fetch behavior */
  queryOptions?: Omit<UseQueryOptions<TOutput, Error>, "queryKey" | "queryFn">;
  /** Fetch executor function */
  fetcher: typeof executeFetch<TInput, TOutput>;
  /** Fetch executor options */
  fetchOptions: FetchExecutorOptions<TInput, TOutput>;
}
