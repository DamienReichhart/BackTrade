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
  const { refreshToken, accessToken, login } = useAuthStore();
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
        if (refreshToken && !isRefreshingToken.current) {
          isRefreshingToken.current = true;
          const authResponse = await refreshTokenUtils(refreshToken);
          if (authResponse) {
            login(authResponse.accessToken, authResponse.refreshToken);
            isRefreshingToken.current = false;
            return mutationFn();
          }
          isRefreshingToken.current = false;
        }
      }
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
