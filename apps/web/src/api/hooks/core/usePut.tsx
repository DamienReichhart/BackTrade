import { useFetch } from "./useFetch";
import type { UseFetchOptions } from "../../../types/api";

/**
 * PUT request hook built on React Query
 *
 * @param url - API endpoint URL
 * @param options - Configuration options (excluding method)
 */
export function usePut<TOutput = unknown, TInput = unknown>(
  url: string,
  options?: Omit<UseFetchOptions<TInput, TOutput>, "method">,
) {
  return useFetch<TOutput, TInput>(url, {
    method: "PUT",
    ...options,
  });
}
