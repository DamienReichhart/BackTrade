import { useFetch, type UseFetchOptions } from './useFetch';

/**
 * POST request hook built on React Query
 * 
 * @param url - API endpoint URL
 * @param options - Configuration options (excluding method)
 */
export function usePost<TOutput = unknown, TInput = unknown>(
  url: string,
  options?: Omit<UseFetchOptions<TInput, TOutput>, 'method'>,
) {
  return useFetch<TOutput, TInput>(url, { 
    ...options, 
    method: 'POST',
    autoFetch: options?.autoFetch ?? false, // Default to false for POST requests
  });
}
