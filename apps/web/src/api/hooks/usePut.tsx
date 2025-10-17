import { useFetch, UseFetchOptions } from "./useFetch";

export function usePut<TOutput = unknown, TInput = unknown>(
  url: string,
  options?: Omit<UseFetchOptions<TInput, TOutput>, "method">,
) {
  return useFetch<TOutput, TInput>(url, { ...options, method: "PUT" });
}
