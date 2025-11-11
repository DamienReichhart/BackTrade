import { useQuery, useMutation } from "@tanstack/react-query";
import type { UseQueryAndMutationOptions } from "../../types";

/**
 * Sets up React Query hooks.
 *
 * @returns Object containing query and mutation hooks, plus an execute function
 */
export function useQueryAndMutation<TInput = unknown, TOutput = unknown>({
  method,
  url,
  isQuery,
  queryOptions = {},
  fetcher,
  fetchOptions,
}: UseQueryAndMutationOptions<TInput, TOutput>) {
  const queryKey = [method, url];

  // Set up query hook for GET requests
  const query = useQuery<TOutput, Error>({
    queryKey,
    queryFn: () => fetcher(undefined, fetchOptions),
    ...queryOptions,
    // Because if not specified, the query will be enabled by default
    enabled: isQuery ? (queryOptions?.enabled ?? true) : false,
  });

  // Set up mutation hook for POST/PUT/DELETE requests
  const mutation = useMutation<TOutput, Error, TInput | undefined>({
    mutationFn: (body?: TInput) => fetcher(body, fetchOptions, true),
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

  return {
    query,
    mutation,
    execute,
  };
}
