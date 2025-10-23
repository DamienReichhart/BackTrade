import {
  useQuery,
  useMutation,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { type z } from "zod";
import { API_BASE_URL } from "../index";

export interface UseFetchOptions<TInput = unknown, TOutput = unknown> {
  /** HTTP method */
  method?: "GET" | "POST" | "PUT" | "DELETE";
  /** Zod schema to validate request body before sending */
  inputSchema?: z.ZodType<TInput>;
  /** Zod schema to validate response data after receiving */
  outputSchema?: z.ZodType<TOutput>;
  /** For GET requests: automatically fetch on mount */
  autoFetch?: boolean;
  /** Additional fetch options */
  fetchOptions?: Omit<RequestInit, "body" | "method">;
  /** React Query options (for GET only) */
  queryOptions?: Omit<
    UseQueryOptions<TOutput, Error>,
    "queryKey" | "queryFn" | "enabled"
  >;
}

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
  }: UseFetchOptions<TInput, TOutput> = {},
) {
  const isQuery = method === "GET";
  const key = [method, url];

  // Common fetch executor
  const fetcher = async (body?: TInput): Promise<TOutput> => {
    let validatedBody: TInput | undefined = body;

    // Validate input with Zod schema if provided
    if (body !== undefined && inputSchema) {
      const inputResult = inputSchema.safeParse(body);
      if (!inputResult.success) {
        const errorMessage = inputResult.error.issues
          .map((err: z.ZodIssue) => `${err.path.join(".")}: ${err.message}`)
          .join("; ");
        throw new Error(`Input validation failed: ${errorMessage}`);
      }
      validatedBody = inputResult.data;
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
      throw new Error(
        `HTTP ${response.status}: ${errorText || response.statusText}`,
      );
    }

    const data = await response.json();

    // Validate output with Zod schema if provided
    if (outputSchema) {
      const outputResult = outputSchema.safeParse(data);
      if (!outputResult.success) {
        const errorMessage = outputResult.error.issues
          .map((err: z.ZodIssue) => `${err.path.join(".")}: ${err.message}`)
          .join("; ");
        throw new Error(`Output validation failed: ${errorMessage}`);
      }
      return outputResult.data;
    }

    return data as TOutput;
  };

  // Use conditional hook calling to avoid Rules of Hooks violation
  const query = isQuery
    ? useQuery<TOutput, Error>({
        queryKey: key,
        queryFn: () => fetcher(),
        enabled: autoFetch,
        ...queryOptions,
      })
    : null;

  const mutation = !isQuery
    ? useMutation<TOutput, Error, TInput | undefined>({
        mutationFn: fetcher,
      })
    : null;

  // Create consistent execute function that always returns Promise<TOutput>
  const execute = async (body?: TInput): Promise<TOutput> => {
    if (isQuery && query) {
      const result = await query.refetch();
      if (result.error) {
        throw result.error;
      }
      return result.data as TOutput;
    } else if (!isQuery && mutation) {
      return await mutation.mutateAsync(body);
    }
    throw new Error("Invalid hook state");
  };

  // Return consistent object shape for all methods
  if (isQuery && query) {
    return {
      data: query.data ?? null,
      error: query.error ?? null,
      isLoading: query.isLoading || query.isFetching,
      isSuccess: query.isSuccess,
      execute,
    };
  }

  if (!isQuery && mutation) {
    return {
      data: mutation.data ?? null,
      error: mutation.error ?? null,
      isLoading: mutation.isPending,
      isSuccess: mutation.isSuccess,
      execute,
    };
  }

  // Fallback for invalid state (should never happen)
  return {
    data: null,
    error: new Error("Invalid hook configuration") as Error,
    isLoading: false,
    isSuccess: false,
    execute: async () => {
      throw new Error("Invalid hook configuration");
    },
  };
}
