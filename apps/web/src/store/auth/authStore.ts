import { create } from "zustand";
import {
    deleteCookie,
    setCookie,
    getCookie,
} from "../../utils/browser/cookies";
import { PublicUserSchema, type PublicUser } from "@backtrade/types";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
    exp?: number;
    sub?: unknown;
}

interface AuthState {
    accessToken: string | undefined;
    refreshToken: string | undefined;
    user: PublicUser | null;
}

interface AuthActions {
    login: (accessToken: string, refreshToken: string) => void;
    logout: () => void;
}

const ACCESS_TOKEN_COOKIE = "access_token";
const REFRESH_TOKEN_COOKIE = "refresh_token";

/**
 * Safely decode a JWT token.
 *
 * This guards against `InvalidTokenError` thrown by `jwt-decode`
 * when the token is missing parts or malformed (e.g. empty string,
 * "undefined", etc.), which can happen if cookies are misconfigured
 * in certain environments (like Docker/prod).
 */
function safeDecodeToken(token: string | undefined): DecodedToken | null {
    if (!token) {
        return null;
    }

    try {
        // Narrow the return type so we don't rely on `any`
        return jwtDecode<DecodedToken>(token);
    } catch {
        return null;
    }
}

/**
 * Extract user from access token
 */
function getUserFromAccessToken(
    accessToken: string | undefined
): PublicUser | null {
    const decoded = safeDecodeToken(accessToken);
    if (!decoded?.sub) {
        return null;
    }

    return PublicUserSchema.parse(decoded.sub);
}

export const useAuthStore = create<AuthState & AuthActions>((set) => {
    const accessToken = getCookie(ACCESS_TOKEN_COOKIE);
    const refreshToken = getCookie(REFRESH_TOKEN_COOKIE);

    return {
        accessToken,
        refreshToken,
        user: getUserFromAccessToken(accessToken),
        login: (newAccessToken, newRefreshToken) => {
            const accessTokenDecoded = safeDecodeToken(newAccessToken);
            const refreshTokenDecoded = safeDecodeToken(newRefreshToken);

            const accessTokenExpiresAt = accessTokenDecoded?.exp;
            const refreshTokenExpiresAt = refreshTokenDecoded?.exp;

            if (!accessTokenExpiresAt || !refreshTokenExpiresAt) {
                // If we get here something is wrong with the backend-issued tokens
                throw new Error("Invalid token expiration");
            }

            setCookie(
                ACCESS_TOKEN_COOKIE,
                newAccessToken,
                accessTokenExpiresAt
            );
            setCookie(
                REFRESH_TOKEN_COOKIE,
                newRefreshToken,
                refreshTokenExpiresAt
            );

            set({
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
                user: getUserFromAccessToken(newAccessToken),
            });
        },
        logout: () => {
            deleteCookie(ACCESS_TOKEN_COOKIE);
            deleteCookie(REFRESH_TOKEN_COOKIE);
            set({
                accessToken: undefined,
                refreshToken: undefined,
                user: null,
            });
        },
    };
});
