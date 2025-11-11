import { useFetch } from "./useFetch";
import type { fetchOptions } from "../../types";

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
    method: "PUT",
    autoFetch: options?.autoFetch ?? false, // Default to false for PUT requests
    ...options,
  });
}
