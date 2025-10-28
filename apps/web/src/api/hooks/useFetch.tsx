import { useQuery, useMutation } from "@tanstack/react-query";
import { API_BASE_URL } from "../index";
import { useAuthStore } from "../../context/AuthContext";
import { validateApiInput, validateApiOutput } from "../utils";
import { AuthResponseSchema, type AuthResponse } from "@backtrade/types";
import type { fetchOptions } from "../types";

/**
 * Unified GET/POST/PUT/DELETE hook built on React Query
 *
 * @param url - API endpoint URL (relative to API_BASE_URL)
 * @param options - Configuration options
 */
export function useFetch<TOutput = unknown, TInput = unknown>(
  url: string,
  {
    method = "GET",
    inputSchema,
    outputSchema,
    autoFetch = false,
    fetchOptions = {},
    queryOptions = {},
  }: fetchOptions<TInput, TOutput> = {},
) {
  const isQuery = method === "GET";
  const key = [method, url];
  const { accessToken, refreshToken, login } = useAuthStore();

  // Perform token refresh without using hooks to avoid recursion
  const refreshAccessToken = async (): Promise<AuthResponse> => {
    const response = await fetch(API_BASE_URL + "/auth/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken: refreshToken ?? "" }),
    });
    if (!response.ok) {
      throw new Error(`Refresh failed: HTTP ${response.status}`);
    }
    const data = await response.json();
    return AuthResponseSchema.parse(data);
  };

  // Common fetch executor
  const fetcher = async (
    body?: TInput,
    retryOnUnauthorized: boolean = true,
  ): Promise<TOutput> => {
    let validatedBody: TInput | undefined = body;

    // Validate input with Zod schema if provided
    if (body !== undefined && inputSchema) {
      validatedBody = validateApiInput<TInput>(inputSchema, body);
    }

    if (accessToken) {
      fetchOptions.headers = {
        Authorization: `Bearer ${accessToken}`,
        ...fetchOptions.headers,
      };
    }

    const response = await fetch(API_BASE_URL + url, {
      method,
      ...fetchOptions,
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions.headers,
      },
      ...(validatedBody !== undefined
        ? { body: JSON.stringify(validatedBody) }
        : {}),
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 401 || response.status === 403) {
        const authResponseData = await refreshAccessToken();
        login(authResponseData.accessToken, authResponseData.refreshToken);
        if (retryOnUnauthorized) {
          return await fetcher(body, false);
        }
      }

      throw new Error(
        `HTTP ${response.status}: ${errorText || response.statusText}`,
      );
    }

    const data = await response.json();

    let validatedOutput: TOutput | undefined;

    // Validate output with Zod schema if provided
    if (outputSchema) {
      validatedOutput = validateApiOutput<TOutput>(outputSchema, data);
    }

    return validatedOutput as TOutput;
  };

  // Always call hooks to avoid Rules of Hooks violation
  const query = useQuery<TOutput, Error>({
    queryKey: key,
    queryFn: () => fetcher(),
    enabled: isQuery && autoFetch,
    ...queryOptions,
  });

  const mutation = useMutation<TOutput, Error, TInput | undefined>({
    mutationFn: (body?: TInput) => fetcher(body, true),
  });

  // Create consistent execute function that always returns Promise<TOutput>
  const execute = async (body?: TInput): Promise<TOutput> => {
    if (isQuery) {
      const result = await query.refetch();
      if (result.error) {
        throw result.error;
      }
      return result.data as TOutput;
    } else {
      return await mutation.mutateAsync(body);
    }
  };

  // Return consistent object shape for all methods
  if (isQuery) {
    return {
      data: query.data ?? null,
      error: query.error ?? null,
      isLoading: query.isLoading || query.isFetching,
      isSuccess: query.isSuccess,
      execute,
    };
  }

  return {
    data: mutation.data ?? null,
    error: mutation.error ?? null,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    execute,
  };
}
