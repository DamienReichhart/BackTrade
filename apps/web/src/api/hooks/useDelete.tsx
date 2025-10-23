import { useFetch, type UseFetchOptions } from './useFetch';

/**
 * DELETE request hook built on React Query
 * 
 * @param url - API endpoint URL
 * @param options - Configuration options (excluding method and inputSchema)
 */
export function useDelete<TOutput = unknown>(
  url: string,
  options?: Omit<UseFetchOptions<never, TOutput>, 'method' | 'inputSchema'>,
) {
  return useFetch<TOutput>(url, { 
    ...options, 
    method: 'DELETE',
    autoFetch: options?.autoFetch ?? false, // Default to false for DELETE requests
  });
}
