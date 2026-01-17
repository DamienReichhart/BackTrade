import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { useAuthStore } from "../../../store/auth";
import { invalidateQueries } from "../utils/query-invalidation";
import { performFetchWithAuth } from "../utils/fetch-utils";

/**
 * Hook for DELETE requests
 */
export function useDelete(
    url: string,
    queriesToInvalidate: string[] | null = null
) {
    const queryClient = useQueryClient();
    const isRefreshingToken = useRef(false);

    const mutationFn = async (): Promise<void> => {
        // Get fresh token from store at mutation execution time
        const currentAccessToken = useAuthStore.getState().accessToken;

        await performFetchWithAuth(
            {
                method: "DELETE",
                url: url,
            },
            currentAccessToken,
            isRefreshingToken
        );
    };

    const mutation = useMutation({
        mutationFn: mutationFn,
        onSuccess: () => {
            invalidateQueries(queryClient, queriesToInvalidate);
        },
    });

    return {
        data: null,
        isLoading: mutation.isPending,
        error: mutation.error,
        execute: mutation.mutateAsync,
    };
}
