import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import type { z } from "zod";
import { useAuthStore } from "../../../store/auth";
import { invalidateQueries } from "../utils/query-invalidation";
import { performFetchWithAuth } from "../utils/fetch-utils";

/**
 * Hook for POST requests with FormData
 */
export function usePostForm<TOutput>(
    url: string,
    outputSchema: z.ZodSchema<TOutput>,
    queriesToInvalidate: string[] | null = null
) {
    const queryClient = useQueryClient();
    const isRefreshingToken = useRef(false);

    const mutationFn = async (formData: FormData): Promise<TOutput> => {
        // Get fresh token from store at mutation execution time
        const currentAccessToken = useAuthStore.getState().accessToken;

        const response = await performFetchWithAuth(
            {
                method: "POST",
                url: url,
                body: formData,
            },
            currentAccessToken,
            isRefreshingToken
        );

        // Handle 204 No Content responses (empty body)
        if (response.status === 204) {
            return outputSchema.parse(undefined);
        }

        const data = await response.json();
        return outputSchema.parse(data);
    };

    const mutation = useMutation({
        mutationFn: mutationFn,
        onSuccess: () => {
            invalidateQueries(queryClient, queriesToInvalidate);
        },
    });

    return {
        data: mutation.data ?? null,
        isLoading: mutation.isPending,
        error: mutation.error,
        execute: mutation.mutateAsync,
    };
}
