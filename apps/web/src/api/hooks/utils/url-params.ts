/**
 * Build URL with query parameters from an object
 *
 * @param basePath - Base URL path (e.g., '/sessions')
 * @param query - Query parameters object
 * @returns Full URL with query string, or base path if no query params
 *
 * @example
 * buildUrlWithParams('/sessions', { startDate: '2024-01-01', limit: 10 })
 * // '/sessions?startDate=2024-01-01&limit=10'
 */
export function buildUrlWithParams(
    basePath: string,
    query?: Record<string, unknown>
): string {
    if (!query) {
        return basePath;
    }

    const searchParams = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
        }
    });

    const queryString = searchParams.toString();
    return queryString ? `${basePath}?${queryString}` : basePath;
}

/**
 * Build URL with additional query parameters appended to existing ones
 *
 * @param basePath - Base URL path
 * @param additionalParams - Additional parameters to append
 * @param existingQuery - Existing query parameters (optional)
 * @returns Full URL with all query parameters
 *
 * @example
 * buildUrlWithAdditionalParams('/instruments/123/candles', { timeframe: 'H1' }, { startDate: '2024-01-01' })
 * // '/instruments/123/candles?timeframe=H1&startDate=2024-01-01'
 */
export function buildUrlWithAdditionalParams(
    basePath: string,
    additionalParams: Record<string, string>,
    existingQuery?: Record<string, unknown>
): string {
    const searchParams = new URLSearchParams();

    // Add existing query params first
    if (existingQuery) {
        Object.entries(existingQuery).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                searchParams.append(key, String(value));
            }
        });
    }

    // Add additional params (these will override existing ones with same key)
    Object.entries(additionalParams).forEach(([key, value]) => {
        searchParams.append(key, value);
    });

    const queryString = searchParams.toString();
    return queryString ? `${basePath}?${queryString}` : basePath;
}
