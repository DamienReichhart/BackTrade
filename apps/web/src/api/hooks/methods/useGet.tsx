import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import type { z } from "zod";
import { useAuthStore } from "../../../store/auth";
import { createQueryKey } from "../utils/query-keys";
import { performFetchWithAuth } from "../utils/fetch-utils";

/**
 * Hook for GET requests with automatic fetching
 * Use enabled: false to skip the query until conditions are met
 */
export function useGet<T = unknown>(
    url: string,
    outputSchema: z.ZodSchema<T>,
    options?: { enabled?: boolean }
) {
    const enabled = options?.enabled ?? true;
    const isRefreshingToken = useRef(false);

    const queryFn = async (): Promise<T> => {
        // Get fresh token from store at query execution time
        const currentAccessToken = useAuthStore.getState().accessToken;

        const response = await performFetchWithAuth(
            {
                method: "GET",
                url: url,
            },
            currentAccessToken,
            isRefreshingToken
        );

        const data = await response.json();
        return outputSchema.parse(data);
    };

    // Create structured query key: ['GET', basePath, queryParams]
    // This allows efficient invalidation by basePath regardless of query parameters
    const queryKey = createQueryKey(url);

    const query = useQuery({
        queryKey: queryKey,
        queryFn: queryFn,
        enabled: enabled,
    });

    return {
        data: query.data ?? null,
        isLoading: query.isLoading,
        error: query.error,
        execute: query.refetch,
    };
}
