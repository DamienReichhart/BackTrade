import { useCallback, useState } from "react";
import { type ZodType } from "zod";
import { validateApiOutput } from "../../utils/validations";
import { useAuthStore } from "../../../store";
import { retryIfUnauthorized } from "../../utils/retryIfUnauthorized";
import { type FetchResponse } from "../../utils";

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
  const [result, setResult] = useState<FetchResponse<TOutput> | null>(null);

  const { accessToken, refreshToken, login } = useAuthStore();

  const execute = useCallback(
    async (
      retryOnUnauthorized: boolean = true,
    ): Promise<FetchResponse<TOutput>> => {
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
          if (retryOnUnauthorized) {
            const retryResult = await retryIfUnauthorized<TOutput>(
              response,
              refreshToken,
              () => execute(false),
              login,
            );
            setResult(retryResult);
            return retryResult;
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const validatedData = validateApiOutput<TOutput>(
          outputSchema,
          responseData,
        );
        setResult({
          data: validatedData,
          status: response.status,
        });
        setIsSuccess(true);
        return result as FetchResponse<TOutput>;
      } catch (fetchError) {
        setError(fetchError as Error);
        throw fetchError;
      } finally {
        setIsLoading(false);
      }
    },
    [data, endpoint, outputSchema],
  );

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
