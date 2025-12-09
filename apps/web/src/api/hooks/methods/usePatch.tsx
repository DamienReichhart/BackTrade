import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import type { z } from "zod";
import { API_BASE_URL } from "../../index";
import { useAuthStore } from "../../../store/auth";
import { refreshToken as refreshTokenUtils } from "../../utils/refresh-token";

/**
 * Hook for PATCH requests
 */
export function usePatch<TInput, TOutput>(
    url: string,
    inputSchema: z.ZodSchema<TInput>,
    outputSchema: z.ZodSchema<TOutput>
) {
    const queryClient = useQueryClient();
    const { login, logout } = useAuthStore();
    const isRefreshingToken = useRef(false);

    /**
     * Performs the actual fetch request with the provided access token
     */
    const performFetch = async (
        body: TInput,
        token: string | undefined
    ): Promise<TOutput> => {
        const validatedBody = inputSchema.parse(body);
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(API_BASE_URL + url, {
            method: "PATCH",
            headers: headers,
            body: JSON.stringify(validatedBody),
        });

        if (!response.ok) {
            if (response.status === 401) {
                const currentRefreshToken = useAuthStore.getState().refreshToken;

                // Try to refresh token if available and not already refreshing
                if (currentRefreshToken && !isRefreshingToken.current) {
                    isRefreshingToken.current = true;
                    try {
                        const authResponse =
                            await refreshTokenUtils(currentRefreshToken);
                        if (authResponse) {
                            login(
                                authResponse.accessToken,
                                authResponse.refreshToken
                            );
                            // Retry with the NEW token from the refresh response
                            return performFetch(body, authResponse.accessToken);
                        }
                        // Token refresh failed - logout user
                        logout();
                        throw new Error("Session expired. Please log in again.");
                    } finally {
                        isRefreshingToken.current = false;
                    }
                } else if (!currentRefreshToken) {
                    // No refresh token available - logout user
                    logout();
                    throw new Error("Authentication required. Please log in.");
                }
                // If already refreshing, throw error to let React Query handle retry
                throw new Error("Token refresh in progress");
            }

            // Handle other error statuses
            let errorMessage = `Request failed with status ${response.status}`;
            try {
                const errorData = await response.json();
                if (errorData?.error?.message) {
                    errorMessage = errorData.error.message;
                }
            } catch {
                // If response is not JSON, use status text
                errorMessage = response.statusText || errorMessage;
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        return outputSchema.parse(data);
    };

    const mutationFn = async (body: TInput): Promise<TOutput> => {
        // Get fresh token from store at mutation execution time
        const currentAccessToken = useAuthStore.getState().accessToken;
        return performFetch(body, currentAccessToken);
    };

    const mutation = useMutation({
        mutationFn: mutationFn,
        onSuccess: () => {
            queryClient.invalidateQueries();
        },
    });

    return {
        data: mutation.data ?? null,
        isLoading: mutation.isPending,
        error: mutation.error,
        execute: mutation.mutateAsync,
    };
}
