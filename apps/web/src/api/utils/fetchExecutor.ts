import { API_BASE_URL } from "../index";
import { validateApiInput, validateApiOutput } from "@backtrade/utils";
import { retryIfUnauthenticated } from "./retryIfUnauthenticated";
import type { FetchExecutorConfig } from "../../types/api";

/**
 * Response object containing both data and HTTP status code.
 */
export interface FetchResponse<TOutput> {
  data: TOutput;
  status: number;
}

/**
 * Executes an API fetch request with validation, error handling, and automatic token refresh.
 *
 * @param body - Optional request body to send
 * @param executorConfig - Configuration for the fetch executor
 * @param retryOnUnauthorized - Whether to retry the request after token refresh (default: true)
 * @returns Promise resolving to an object containing the validated response data and HTTP status code
 * @throws Error if the request fails or validation fails
 */
export async function executeFetch<TInput = unknown, TOutput = unknown>(
  body: TInput | undefined,
  executorConfig: FetchExecutorConfig<TInput, TOutput>,
  retryOnUnauthorized: boolean = true,
): Promise<FetchResponse<TOutput>> {
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
    if (retryOnUnauthorized) {
      return await retryIfUnauthenticated<TOutput>(
        response,
        executorConfig.refreshToken,
        () => executeFetch(body, executorConfig, false),
        executorConfig.onTokenRefresh ?? (() => {}),
      );
    }
  }

  // Capture status code before processing response
  const statusCode = response.status;

  // Check for empty responses (204 No Content, 205 Reset Content, or no content)
  const contentType = response.headers.get("content-type");
  const contentLength = response.headers.get("content-length");
  const isEmptyResponse =
    response.status === 204 ||
    response.status === 205 ||
    contentLength === "0" ||
    (contentType === null && contentLength === null);

  // Return undefined data for empty responses, but still include status code
  if (isEmptyResponse) {
    return {
      data: undefined as TOutput,
      status: statusCode,
    };
  }

  // Parse and validate response
  const responseData = await response.json();

  let validatedData: TOutput;
  if (executorConfig.outputSchema) {
    validatedData = validateApiOutput<TOutput>(
      executorConfig.outputSchema,
      responseData,
    );
  } else {
    validatedData = responseData as TOutput;
  }

  return {
    data: validatedData,
    status: statusCode,
  };
}
