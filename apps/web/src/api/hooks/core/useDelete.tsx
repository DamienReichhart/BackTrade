import { useFetch } from "./useFetch";
import type { UseFetchOptions } from "../../../types/api";

/**
 * DELETE request hook built on React Query
 *
 * @param url - API endpoint URL
 * @param options - Configuration options (excluding method and inputSchema)
 */
export function useDelete<TOutput = unknown>(
  url: string,
  options?: Omit<UseFetchOptions<never, TOutput>, "method" | "inputSchema">,
) {
  return useFetch<TOutput>(url, {
    method: "DELETE",
    ...options,
  });
}
