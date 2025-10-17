import { useFetch, UseFetchOptions } from "./useFetch";

export function useGet<TOutput = unknown>(
  url: string,
  options?: Omit<UseFetchOptions<never, TOutput>, "method" | "inputSchema">,
) {
  return useFetch<TOutput>(url, { ...options, method: "GET" });
}
