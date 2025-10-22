import { useFetch, type UseFetchOptions } from "./useFetch";

export function usePost<TOutput = unknown, TInput = unknown>(
  url: string,
  options?: Omit<UseFetchOptions<TInput, TOutput>, "method">,
) {
  return useFetch<TOutput, TInput>(url, { ...options, method: "POST" });
}
