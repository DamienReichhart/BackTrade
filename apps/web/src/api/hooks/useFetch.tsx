import { useState } from "react";
import { type z } from "zod";
import { API_BASE_URL } from "../index";

export interface UseFetchOptions<TInput = unknown, TOutput = unknown>
  extends Omit<RequestInit, "body"> {
  /** Zod schema to validate request body before sending */
  inputSchema?: z.ZodType<TInput>;
  /** Zod schema to validate response data after receiving */
  outputSchema?: z.ZodType<TOutput>;
}

export function useFetch<TOutput = unknown, TInput = unknown>(
  url: string,
  options: UseFetchOptions<TInput, TOutput> = {},
) {
  const { inputSchema, outputSchema, ...fetchOptions } = options;
  const [result, setResult] = useState<TOutput | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  const request = async (body?: TInput, requestOptions: RequestInit = {}) => {
    setLoading(true);
    setError(null);

    try {
      let validatedBody: unknown = body;

      // Validate input format with Zod schema if provided
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

      // Prepare request body
      const requestBody =
        validatedBody !== undefined ? JSON.stringify(validatedBody) : undefined;

      const response = await fetch(API_BASE_URL + url, {
        ...fetchOptions,
        ...requestOptions,
        body: requestBody,
        headers: {
          "Content-Type": "application/json",
          ...fetchOptions.headers,
          ...requestOptions.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Validate output format with Zod schema if provided
      if (outputSchema) {
        const outputResult = outputSchema.safeParse(data);
        if (!outputResult.success) {
          const errorMessage = outputResult.error.issues
            .map(
              (err: z.core.$ZodIssue) =>
                `${err.path.join(".")}: ${err.message}`,
            )
            .join("; ");
          throw new Error(`Output validation failed: ${errorMessage}`);
        }
        setResult(outputResult.data);
        return outputResult.data;
      } else {
        setResult(data as TOutput);
        return data as TOutput;
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { result, error, loading, request };
}
