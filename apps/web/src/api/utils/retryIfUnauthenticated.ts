import { type FetchResponse } from "./fetchExecutor";
import { refreshAccessToken } from "./tokenRefresh";

export async function retryIfUnauthenticated<TOutput>(
  response: Response,
  refreshToken: string | undefined,
  retryFunction: () => Promise<FetchResponse<TOutput>>,
  onTokenRefresh: (
    accessToken: string,
    refreshToken: string,
  ) => void | undefined,
) {
  const errorText = await response.text();
  if (response.status === 401) {
    // Attempt to refresh the token
    if (!refreshToken) {
      throw new Error(
        `HTTP ${response.status}: ${errorText || response.statusText}`,
      );
    }

    try {
      const refreshedTokens = await refreshAccessToken(refreshToken);

      // Update tokens using the callback
      if (onTokenRefresh) {
        onTokenRefresh(
          refreshedTokens.accessToken,
          refreshedTokens.refreshToken,
        );
      }

      // Retry the request with the new token
      const retryResult = await retryFunction();
      return retryResult;
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
