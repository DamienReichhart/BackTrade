import { useFetch } from "./useFetch";
import type { UseFetchOptions } from "../../../types/api";

/**
 * GET request hook built on React Query
 *
 * @param url - API endpoint URL
 * @param options - Configuration options (excluding method and inputSchema)
 */
export function useGet<TOutput = unknown>(
  url: string,
  options?: Omit<UseFetchOptions<never, TOutput>, "method" | "inputSchema">,
) {
  const { queryOptions, ...restOptions } = options ?? {};
  return useFetch<TOutput>(url, {
    method: "GET",
    // Default enabled to true for GET requests if not specified
    queryOptions: {
      enabled: queryOptions?.enabled ?? true,
      ...queryOptions,
    },
    ...restOptions,
  });
}
