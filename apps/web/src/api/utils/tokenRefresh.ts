import { API_BASE_URL } from "../index";
import { validateApiOutput } from "@backtrade/utils";
import { AuthResponseSchema, type AuthResponse } from "@backtrade/types";

/**
 * Performs token refresh without using hooks to avoid recursion.
 *
 * @param refreshToken - The refresh token to use for authentication
 * @returns Promise resolving to the new auth response with access and refresh tokens
 * @throws Error if the refresh request fails
 */
export async function refreshAccessToken(
  refreshToken: string,
): Promise<AuthResponse> {
  const response = await fetch(API_BASE_URL + "/auth/refresh", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    throw new Error(`Refresh failed: HTTP ${response.status}`);
  }

  const data = await response.json();
  return validateApiOutput<AuthResponse>(AuthResponseSchema, data);
}
