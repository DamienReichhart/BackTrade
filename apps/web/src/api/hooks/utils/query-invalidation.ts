import type { QueryClient } from "@tanstack/react-query";
import { invalidateByBasePath, parseUrl } from "./query-keys";

/**
 * Invalidate queries based on provided URLs
 *
 * @param queryClient - React Query client instance
 * @param queriesToInvalidate - Array of query URLs to invalidate, or null to invalidate all
 */
export function invalidateQueries(
    queryClient: QueryClient,
    queriesToInvalidate: string[] | null
): void {
    if (queriesToInvalidate === null) {
        queryClient.invalidateQueries();
    } else {
        queriesToInvalidate.forEach((queryUrl) => {
            const { basePath } = parseUrl(queryUrl);
            invalidateByBasePath(queryClient, basePath);
        });
    }
}
