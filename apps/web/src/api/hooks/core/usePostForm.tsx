import { useCallback, useState } from "react";
import { type ZodType } from "zod";
import { validateApiOutput } from "../../utils/validations";
import { useAuthStore } from "../../../store";
import { retryIfUnauthorized } from "../../utils/retryIfUnauthorized";
import { type FetchResponse } from "../../utils";
import { API_BASE_URL } from "../../index";

/**
 * Hook to post form data with file uploads (does not use React Query for simplicity)
 *
 * Note: Do not set Content-Type header for multipart/form-data as the browser
 * will set it automatically with the correct boundary parameter
 */
export function usePostForm<TOutput = unknown>(
  endpoint: string,
  method: "POST" | "PUT" | "PATCH",
  outputSchema: ZodType<TOutput>,
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [status, setStatus] = useState<number | null>(null);

  const { accessToken, refreshToken, login } = useAuthStore();

  const execute = useCallback(
    async (
      formData: FormData,
      retryOnUnauthorized: boolean = true,
    ): Promise<FetchResponse<TOutput>> => {
      setIsLoading(true);
      setError(null);
      setIsSuccess(false);
      setStatus(null);
      try {
        const response = await fetch(API_BASE_URL + endpoint, {
          method,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        });
        let responseData = await response.json();
        setStatus(response.status);

        if (!response.ok) {
          if (retryOnUnauthorized) {
            responseData = await retryIfUnauthorized<TOutput>(
              response,
              refreshToken,
              () => execute(formData, false),
              login,
            );
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const validatedData = validateApiOutput<TOutput>(
          outputSchema,
          responseData,
        );
        setIsSuccess(true);
        return {
          data: validatedData,
          status: response.status,
        } as FetchResponse<TOutput>;
      } catch (fetchError) {
        setError(fetchError as Error);
        throw fetchError;
      } finally {
        setIsLoading(false);
      }
    },
    [endpoint, method, outputSchema, accessToken, refreshToken, login],
  );

  return {
    execute,
    isLoading,
    error,
    isSuccess,
    status,
  };
}
