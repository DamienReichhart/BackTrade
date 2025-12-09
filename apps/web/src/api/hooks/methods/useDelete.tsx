import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { API_BASE_URL } from "../../index";
import { refreshToken as refreshTokenUtils } from "../../utils/refresh-token";
import { useAuthStore } from "../../../store";

/**
 * Hook for DELETE requests
 */
export function useDelete(url: string) {
    const queryClient = useQueryClient();
    const { refreshToken, accessToken, login, logout } = useAuthStore();
    const isRefreshingToken = useRef(false);

    const mutationFn = async (): Promise<void> => {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };
        if (accessToken) {
            headers["Authorization"] = `Bearer ${accessToken}`;
        }

        const response = await fetch(API_BASE_URL + url, {
            method: "DELETE",
            headers: headers,
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
                        return mutationFn();
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
    };

    const mutation = useMutation({
        mutationFn: mutationFn,
        onSuccess: () => {
            queryClient.invalidateQueries();
        },
    });

    return {
        data: null,
        isLoading: mutation.isPending,
        error: mutation.error,
        execute: mutation.mutateAsync,
    };
}
