import { useFetch, type fetchOptions } from "./useFetch";

/**
 * PUT request hook built on React Query
 *
 * @param url - API endpoint URL
 * @param options - Configuration options (excluding method)
 */
export function usePut<TOutput = unknown, TInput = unknown>(
  url: string,
  options?: Omit<fetchOptions<TInput, TOutput>, "method">,
) {
  return useFetch<TOutput, TInput>(url, {
    ...options,
    method: "PUT",
    autoFetch: options?.autoFetch ?? false, // Default to false for PUT requests
  });
}
