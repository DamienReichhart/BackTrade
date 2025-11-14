import type { UseQueryOptions } from "@tanstack/react-query";
import type { executeFetch, FetchResponse } from "../utils/fetchExecutor";
import type { FetchExecutorConfig, HttpMethod } from ".";

export interface QueryAndMutationHookConfig<TInput, TOutput> {
  /** HTTP method */
  method: HttpMethod;
  /** API endpoint URL for React Query key */
  url: string;
  /** Whether this is a GET request (query) or mutation */
  isQuery: boolean;
  /** React Query options (for queries only). Use `enabled` to control auto-fetch behavior */
  queryOptions?: Omit<
    UseQueryOptions<FetchResponse<TOutput>, Error>,
    "queryKey" | "queryFn"
  >;
  /** Fetch executor function */
  fetcher: typeof executeFetch<TInput, TOutput>;
  /** Fetch executor configuration */
  executorConfig: FetchExecutorConfig<TInput, TOutput>;
}
