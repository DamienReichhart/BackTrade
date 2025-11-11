import { API_BASE_URL } from "../index";
import { validateApiInput, validateApiOutput } from "./validations";
import { refreshAccessToken } from "./tokenRefresh";
import type { FetchExecutorOptions } from "../types";

/**
 * Executes an API fetch request with validation, error handling, and automatic token refresh.
 *
 * @param body - Optional request body to send
 * @param options - Configuration options for the fetch request
 * @param retryOnUnauthorized - Whether to retry the request after token refresh (default: true)
 * @returns Promise resolving to the validated response data
 * @throws Error if the request fails or validation fails
 */
export async function executeFetch<TInput = unknown, TOutput = unknown>(
  body: TInput | undefined,
  options: FetchExecutorOptions<TInput, TOutput>,
  retryOnUnauthorized: boolean = true,
): Promise<TOutput> {
  let validatedBody: TInput | undefined = body;

  // Validate input with Zod schema if provided
  if (body !== undefined && options.inputSchema) {
    validatedBody = validateApiInput<TInput>(options.inputSchema, body);
  }

  // Prepare headers with authorization if access token is available
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.fetchOptions?.headers as Record<string, string> | undefined),
  };

  if (options.accessToken) {
    headers["Authorization"] = `Bearer ${options.accessToken}`;
  }

  // Execute the fetch request
  const response = await fetch(API_BASE_URL + options.url, {
    method: options.method,
    ...options.fetchOptions,
    headers,
    ...(validatedBody !== undefined
      ? { body: JSON.stringify(validatedBody) }
      : {}),
  });

  // Handle unauthorized responses with token refresh
  if (!response.ok) {
    const errorText = await response.text();

    if (
      (response.status === 401 || response.status === 403) &&
      retryOnUnauthorized
    ) {
      // Attempt to refresh the token
      if (!options.refreshToken) {
        throw new Error(
          `HTTP ${response.status}: ${errorText || response.statusText}`,
        );
      }

      try {
        const authResponseData = await refreshAccessToken(options.refreshToken);

        // Update tokens using the callback
        if (options.onTokenRefresh) {
          options.onTokenRefresh(
            authResponseData.accessToken,
            authResponseData.refreshToken,
          );
        }

        // Retry the request with the new token
        return await executeFetch(
          body,
          {
            ...options,
            accessToken: authResponseData.accessToken,
            refreshToken: authResponseData.refreshToken,
          },
          false,
        );
      } catch (refreshError) {
        throw new Error(
          `Token refresh failed: ${refreshError instanceof Error ? refreshError.message : "Unknown error"}`,
        );
      }
    }

    throw new Error(
      `HTTP ${response.status}: ${errorText || response.statusText}`,
    );
  }

  // Parse and validate response
  const data = await response.json();

  if (options.outputSchema) {
    return validateApiOutput<TOutput>(options.outputSchema, data);
  }

  return data as TOutput;
}
