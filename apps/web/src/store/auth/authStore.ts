import { create } from "zustand";
import {
    deleteCookie,
    setCookie,
    getCookie,
} from "../../utils/browser/cookies";
import { type PublicUser } from "@backtrade/types";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
    exp?: number;
    sub?: number;
}

interface AuthState {
    accessToken: string | undefined;
    refreshToken: string | undefined;
    user: PublicUser | null;
    isInitialized: boolean;
}

interface AuthActions {
    login: (accessToken: string, refreshToken: string) => void;
    logout: () => void;
    setUser: (user: PublicUser | null) => void;
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
        return jwtDecode<DecodedToken>(token);
    } catch {
        return null;
    }
}

export const useAuthStore = create<AuthState & AuthActions>((set) => {
    const accessToken = getCookie(ACCESS_TOKEN_COOKIE);
    const refreshToken = getCookie(REFRESH_TOKEN_COOKIE);

    return {
        accessToken,
        refreshToken,
        user: null,
        isInitialized: false,

        /**
         * Store tokens after successful login/registration
         *
         * User data should be fetched separately via /auth/me endpoint
         */
        login: (newAccessToken, newRefreshToken) => {
            const accessTokenDecoded = safeDecodeToken(newAccessToken);
            const refreshTokenDecoded = safeDecodeToken(newRefreshToken);

            const accessTokenExpiresAt = accessTokenDecoded?.exp;
            const refreshTokenExpiresAt = refreshTokenDecoded?.exp;

            if (!accessTokenExpiresAt || !refreshTokenExpiresAt) {
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
            });
        },

        /**
         * Clear all auth state and cookies
         */
        logout: () => {
            deleteCookie(ACCESS_TOKEN_COOKIE);
            deleteCookie(REFRESH_TOKEN_COOKIE);
            set({
                accessToken: undefined,
                refreshToken: undefined,
                user: null,
                isInitialized: true,
            });
        },

        /**
         * Set the current user data
         *
         * Called after fetching user from /auth/me endpoint
         */
        setUser: (user) => {
            set({
                user,
                isInitialized: true,
            });
        },
    };
});
