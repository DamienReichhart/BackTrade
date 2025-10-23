import { useFetch, type UseFetchOptions } from "./useFetch";

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
  return useFetch<TOutput>(url, {
    ...options,
    method: "GET",
    autoFetch: options?.autoFetch ?? true, // Default to true for GET requests
  });
}
