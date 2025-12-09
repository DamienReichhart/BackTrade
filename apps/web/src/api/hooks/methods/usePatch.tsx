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
    const { accessToken, refreshToken, login, logout } = useAuthStore();
    const isRefreshingToken = useRef(false);

    const mutationFn = async (body: TInput): Promise<TOutput> => {
        const validatedBody = inputSchema.parse(body);

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };
        if (accessToken) {
            headers["Authorization"] = `Bearer ${accessToken}`;
        }

        const response = await fetch(API_BASE_URL + url, {
            method: "PATCH",
            headers: headers,
            body: JSON.stringify(validatedBody),
        });

        if (!response.ok) {
            if (response.status === 401) {
                // Try to refresh token if available
                if (refreshToken && !isRefreshingToken.current) {
                    isRefreshingToken.current = true;
                    const authResponse = await refreshTokenUtils(refreshToken);
                    if (authResponse) {
                        login(
                            authResponse.accessToken,
                            authResponse.refreshToken
                        );
                        isRefreshingToken.current = false;
                        // Retry the original request with new token
                        return mutationFn(body);
                    }
                    // Token refresh failed - logout user
                    isRefreshingToken.current = false;
                    logout();
                    throw new Error("Session expired. Please log in again.");
                } else if (!refreshToken) {
                    // No refresh token available - logout user
                    logout();
                    throw new Error("Authentication required. Please log in.");
                }
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
