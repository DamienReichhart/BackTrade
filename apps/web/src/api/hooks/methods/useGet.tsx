import { useQuery } from "@tanstack/react-query";
import type { z } from "zod";
import { API_BASE_URL } from "../../index";
import { useAuthStore } from "../../../store/auth";
import { refreshToken as refreshTokenUtils } from "../../utils/refresh-token";

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
  const { accessToken, refreshToken, login } = useAuthStore();
  let isRefreshingToken = false;

  const queryFn = async (): Promise<T> => {
    let headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }
    const response = await fetch(API_BASE_URL + url, {
      method: "GET",
      headers: headers,
      },
    );

    if (!response.ok) {
      if (response.status === 401) {
        if (refreshToken && !isRefreshingToken) {
          isRefreshingToken = true;
          const authResponse = await refreshTokenUtils(refreshToken);
          if (authResponse) {
            login(authResponse.accessToken, authResponse.refreshToken);
            return queryFn();
          }
        }
      }
    }

    const data = await response.json();
    return outputSchema.parse(data);
  };

  const query = useQuery({
    queryKey: [url],
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
