import { useCallback, useState } from "react";
import { type ZodType } from "zod";
import { validateApiOutput } from "../../utils/validations";
import { useAuthStore } from "../../../store";

/**
 * Hook to fetch data from a form (does not use React Query for simplicity)
 */
export function usePostForm<TOutput = unknown>(
  endpoint: string,
  method: "POST" | "PUT" | "PATCH",
  outputSchema: ZodType<TOutput>,
) {
  const [data, setData] = useState<FormData>(() => new FormData());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [status, setStatus] = useState<number | null>(null);
  const [result, setResult] = useState<TOutput | null>(null);

  const { accessToken } = useAuthStore();

  const execute = useCallback(async (): Promise<TOutput> => {
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);
    setStatus(null);
    setResult(null);
    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${accessToken}`,
        },
        body: data,
      });
      const responseData = await response.json();
      setStatus(response.status);

      if (!response.ok) {
        throw new Error(
          `Request failed with status ${response.status}: ${JSON.stringify(responseData)}`,
        );
      }

      const validatedData = validateApiOutput<TOutput>(
        outputSchema,
        responseData,
      );
      setResult(validatedData);
      setIsSuccess(true);
      return validatedData;
    } catch (fetchError) {
      setError(fetchError as Error);
      throw fetchError;
    } finally {
      setIsLoading(false);
    }
  }, [data, endpoint, outputSchema]);

  return {
    data,
    setData,
    execute,
    isLoading,
    error,
    isSuccess,
    status,
    result,
  };
}
