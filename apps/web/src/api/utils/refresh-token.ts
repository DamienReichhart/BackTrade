import { API_BASE_URL } from "../index";
import {
    RefreshTokenRequestSchema,
    AuthResponseSchema,
} from "@backtrade/types";

/**
 * Refresh the access token using a refresh token
 *
 * @param refreshToken - The refresh token to use for getting a new access token
 * @returns AuthResponse with new access and refresh tokens, or null if refresh fails
 */
export const refreshToken = async (refreshToken: string) => {
    try {
        const validatedRequest = RefreshTokenRequestSchema.parse({
            refreshToken: refreshToken,
        });

        const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(validatedRequest),
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        const authResponse = AuthResponseSchema.parse(data);
        return authResponse;
    } catch {
        return null;
    }
};
