import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import type { z } from "zod";
import { useAuthStore } from "../../../store/auth";
import { invalidateQueries } from "../utils/query-invalidation";
import { performFetchWithAuth } from "../utils/fetch-utils";

/**
 * Hook for PATCH requests
 */
export function usePatch<TInput, TOutput>(
    url: string,
    inputSchema: z.ZodSchema<TInput>,
    outputSchema: z.ZodSchema<TOutput>,
    queriesToInvalidate: string[] | null = null
) {
    const queryClient = useQueryClient();
    const isRefreshingToken = useRef(false);

    const mutationFn = async (body: TInput): Promise<TOutput> => {
        // Get fresh token from store at mutation execution time
        const currentAccessToken = useAuthStore.getState().accessToken;
        const validatedBody = inputSchema.parse(body);

        const response = await performFetchWithAuth(
            {
                method: "PATCH",
                url: url,
                body: JSON.stringify(validatedBody),
            },
            currentAccessToken,
            isRefreshingToken
        );

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
