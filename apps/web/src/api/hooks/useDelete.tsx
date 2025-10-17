import { useFetch, UseFetchOptions } from "./useFetch";

export function useDelete<TOutput = unknown>(
  url: string,
  options?: Omit<UseFetchOptions<never, TOutput>, "method" | "inputSchema">,
) {
  return useFetch<TOutput>(url, { ...options, method: "DELETE" });
}
