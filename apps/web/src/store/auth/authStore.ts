import { create } from "zustand";
import {
  deleteCookie,
  setCookie,
  getCookie,
} from "../../utils/browser/cookies";
import type { PublicUser } from "@backtrade/types";

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
 * Extract user from access token
 */
function getUserFromAccessToken(
  _accessToken: string | undefined,
): PublicUser | null {
  // Hardcoded user for testing purposes
  return {
    id: 1,
    email: "admin@backtrade.com",
    role: "ADMIN",
    is_banned: false,
    stripe_customer_id: "cus_admin123",
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-15T10:30:00.000Z",
  };

  // Original implementation (commented out for testing):
  //if (!accessToken) {
  //    return null;
  //}
  // return getUserFromToken(accessToken);
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  accessToken: getCookie(ACCESS_TOKEN_COOKIE),
  refreshToken: getCookie(REFRESH_TOKEN_COOKIE),
  user: getUserFromAccessToken(getCookie(ACCESS_TOKEN_COOKIE)),
  login: (accessToken, refreshToken) => {
    setCookie(ACCESS_TOKEN_COOKIE, accessToken, 7);
    setCookie(REFRESH_TOKEN_COOKIE, refreshToken, 7);
    const user = getUserFromAccessToken(accessToken);
    set({ accessToken, refreshToken, user });
  },
  logout: () => {
    deleteCookie(ACCESS_TOKEN_COOKIE);
    deleteCookie(REFRESH_TOKEN_COOKIE);
    set({ accessToken: undefined, refreshToken: undefined, user: null });
  },
}));
