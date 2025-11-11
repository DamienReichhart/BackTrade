import { useFetch } from "./useFetch";
import type { fetchOptions } from "../../types";

/**
 * DELETE request hook built on React Query
 *
 * @param url - API endpoint URL
 * @param options - Configuration options (excluding method and inputSchema)
 */
export function useDelete<TOutput = unknown>(
  url: string,
  options?: Omit<fetchOptions<never, TOutput>, "method" | "inputSchema">,
) {
  return useFetch<TOutput>(url, {
    method: "DELETE",
    autoFetch: options?.autoFetch ?? false, // Default to false for DELETE requests
    ...options,
  });
}
