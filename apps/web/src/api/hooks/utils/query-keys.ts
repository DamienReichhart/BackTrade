import type { QueryClient } from "@tanstack/react-query";

/**
 * Query Key Utilities
 *
 * Provides consistent query key structure across all API hooks.
 * Query keys are structured as: [method, basePath, queryParams]
 * This allows efficient invalidation by basePath regardless of query parameters.
 */

/**
 * Parse a URL into base path and query parameters
 *
 * @param url - Full URL string (e.g., '/sessions/123/positions?status=OPEN&limit=10000')
 * @returns Object with basePath and queryParams
 *
 * @example
 * parseUrl('/sessions/123/positions?status=OPEN&limit=10000')
 * // { basePath: '/sessions/123/positions', queryParams: { status: 'OPEN', limit: '10000' } }
 */
export function parseUrl(url: string): {
    basePath: string;
    queryParams: Record<string, string>;
} {
    const [basePath, queryString] = url.split("?");
    const queryParams: Record<string, string> = {};

    if (queryString) {
        const params = new URLSearchParams(queryString);
        params.forEach((value, key) => {
            queryParams[key] = value;
        });
    }

    return { basePath, queryParams };
}

/**
 * Create a structured query key for GET requests
 *
 * Query keys are structured as: ['GET', basePath, queryParams]
 * This allows invalidation by basePath regardless of query parameters.
 *
 * @param url - Full URL string
 * @returns Structured query key array
 *
 * @example
 * createQueryKey('/sessions/123/positions?status=OPEN&limit=10000')
 * // ['GET', '/sessions/123/positions', { status: 'OPEN', limit: '10000' }]
 */
export function createQueryKey(
    url: string
): [string, string, Record<string, string>] {
    const { basePath, queryParams } = parseUrl(url);
    return ["GET", basePath, queryParams];
}

/**
 * Check if a query key matches a base path (for invalidation)
 *
 * This function checks if a query key's base path matches the provided base path,
 * regardless of query parameters. This allows invalidating all queries for a resource
 * regardless of their query parameters.
 *
 * @param queryKey - React Query key array (readonly)
 * @param basePath - Base path to match against
 * @returns True if the query key matches the base path
 *
 * @example
 * matchesBasePath(['GET', '/sessions/123/positions', { status: 'OPEN' }], '/sessions/123/positions')
 * // true
 */
export function matchesBasePath(
    queryKey: readonly unknown[],
    basePath: string
): boolean {
    // Query keys are structured as: ['GET', basePath, queryParams]
    if (Array.isArray(queryKey) && queryKey.length >= 2) {
        const keyBasePath = queryKey[1];
        return typeof keyBasePath === "string" && keyBasePath === basePath;
    }
    return false;
}

/**
 * Invalidate queries by base path
 *
 * Invalidates all queries that match the given base path, regardless of query parameters.
 * This is useful when you want to invalidate all variations of a query (e.g., all positions
 * queries for a session, regardless of status or limit filters).
 *
 * @param queryClient - React Query client instance
 * @param basePath - Base path to invalidate (e.g., '/sessions/123/positions')
 */
export function invalidateByBasePath(
    queryClient: QueryClient,
    basePath: string
): void {
    queryClient.invalidateQueries({
        predicate: (query) => {
            return matchesBasePath(query.queryKey, basePath);
        },
    });
}
