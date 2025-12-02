import { create } from "zustand";
import {
  deleteCookie,
  setCookie,
  getCookie,
} from "../../utils/browser/cookies";
import { PublicUserSchema, type PublicUser } from "@backtrade/types";
import { jwtDecode } from "jwt-decode";

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
  accessToken: string | undefined,
): PublicUser | null {
  if (!accessToken) {
    return null;
  }

  const decoded = jwtDecode(accessToken);
  return PublicUserSchema.parse(decoded.sub);
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  accessToken: getCookie(ACCESS_TOKEN_COOKIE),
  refreshToken: getCookie(REFRESH_TOKEN_COOKIE),
  user: getUserFromAccessToken(getCookie(ACCESS_TOKEN_COOKIE)),
  login: (accessToken, refreshToken) => {
    const accessTokenDecoded = jwtDecode(accessToken);
    const refreshTokenDecoded = jwtDecode(refreshToken);
    const accessTokenExpiresAt = accessTokenDecoded.exp;
    const refreshTokenExpiresAt = refreshTokenDecoded.exp;
    if (!accessTokenExpiresAt || !refreshTokenExpiresAt) {
      throw new Error("Invalid token expiration");
    }
    setCookie(ACCESS_TOKEN_COOKIE, accessToken, accessTokenExpiresAt);
    setCookie(REFRESH_TOKEN_COOKIE, refreshToken, refreshTokenExpiresAt);
    set({ accessToken, refreshToken });
  },
  logout: () => {
    deleteCookie(ACCESS_TOKEN_COOKIE);
    deleteCookie(REFRESH_TOKEN_COOKIE);
    set({ accessToken: undefined, refreshToken: undefined, user: null });
  },
}));
