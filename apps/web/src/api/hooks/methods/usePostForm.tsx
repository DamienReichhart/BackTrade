import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { z } from "zod";
import { API_BASE_URL } from "../../index";
import { useAuthStore } from "../../../store/auth";
import { refreshToken as refreshTokenUtils } from "../../utils/refresh-token";

/**
 * Hook for POST requests with FormData
 */
export function usePostForm<TOutput>(url: string, outputSchema: z.ZodSchema<TOutput>) {
  const queryClient = useQueryClient();
  const { accessToken, refreshToken, login } = useAuthStore();
  let isRefreshingToken = false;

  const mutationFn = async (formData: FormData): Promise<TOutput> => {
    let headers: Record<string, string> = {
      "Content-Type": "multipart/form-data",
    };
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const response = await fetch(API_BASE_URL + url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        if (refreshToken && !isRefreshingToken) {
          isRefreshingToken = true;
          const authResponse = await refreshTokenUtils(refreshToken);
          if (authResponse) {
            login(authResponse.accessToken, authResponse.refreshToken);
            return mutationFn(formData);
          }
        }
      }
    }

    const data = await response.json();
    return outputSchema.parse(data);
  }

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
