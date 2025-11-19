import { useState } from "react";

/**
 * Hook to fetch data from a form (does not use React Query for simplicity)
 */
export const usePostForm = (endpoint: string) => {
  const [data, setData] = useState<FormData>(() => new FormData());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [status, setStatus] = useState<number | null>(null);

  const execute = async () => {
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);
    setStatus(null);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: data,
      });
    } catch (error) {
      setError(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  return { data, setData, execute, isLoading, error, isSuccess, status };
};
