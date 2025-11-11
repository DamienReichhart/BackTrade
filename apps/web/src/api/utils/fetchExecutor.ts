import { API_BASE_URL } from "../index";
import { validateApiInput, validateApiOutput } from "./validations";
import { refreshAccessToken } from "./tokenRefresh";
import type { FetchExecutorConfig } from "../types";

/**
 * Executes an API fetch request with validation, error handling, and automatic token refresh.
 *
 * @param body - Optional request body to send
 * @param executorConfig - Configuration for the fetch executor
 * @param retryOnUnauthorized - Whether to retry the request after token refresh (default: true)
 * @returns Promise resolving to the validated response data
 * @throws Error if the request fails or validation fails
 */
export async function executeFetch<TInput = unknown, TOutput = unknown>(
  body: TInput | undefined,
  executorConfig: FetchExecutorConfig<TInput, TOutput>,
  retryOnUnauthorized: boolean = true,
): Promise<TOutput> {
  let validatedBody: TInput | undefined = body;

  // Validate input with Zod schema if provided
  if (body !== undefined && executorConfig.inputSchema) {
    validatedBody = validateApiInput<TInput>(executorConfig.inputSchema, body);
  }

  // Prepare headers with authorization if access token is available
  const { headers: providedHeaders, ...remainingRequestInit } =
    executorConfig.requestInit ?? {};

  const headers = new Headers(providedHeaders);
  headers.set("Content-Type", "application/json");

  if (executorConfig.accessToken) {
    headers.set("Authorization", `Bearer ${executorConfig.accessToken}`);
  }

  // Execute the fetch request
  const response = await fetch(API_BASE_URL + executorConfig.url, {
    method: executorConfig.method,
    ...remainingRequestInit,
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
      if (!executorConfig.refreshToken) {
        throw new Error(
          `HTTP ${response.status}: ${errorText || response.statusText}`,
        );
      }

      try {
        const refreshedTokens = await refreshAccessToken(
          executorConfig.refreshToken,
        );

        // Update tokens using the callback
        if (executorConfig.onTokenRefresh) {
          executorConfig.onTokenRefresh(
            refreshedTokens.accessToken,
            refreshedTokens.refreshToken,
          );
        }

        // Retry the request with the new token
        return await executeFetch(
          body,
          {
            ...executorConfig,
            accessToken: refreshedTokens.accessToken,
            refreshToken: refreshedTokens.refreshToken,
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

  // Check for empty responses (204 No Content, 205 Reset Content, or no content)
  const contentType = response.headers.get("content-type");
  const contentLength = response.headers.get("content-length");
  const isEmptyResponse =
    response.status === 204 ||
    response.status === 205 ||
    contentLength === "0" ||
    (contentType === null && contentLength === null);

  // Return undefined for empty responses
  if (isEmptyResponse) {
    return undefined as TOutput;
  }

  // Parse and validate response
  const responseData = await response.json();

  if (executorConfig.outputSchema) {
    return validateApiOutput<TOutput>(
      executorConfig.outputSchema,
      responseData,
    );
  }

  return responseData as TOutput;
}
