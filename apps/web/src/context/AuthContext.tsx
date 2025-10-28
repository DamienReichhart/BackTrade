import { create } from "zustand";
import { deleteCookie, setCookie, getCookie } from "../utils/cookies";

interface AuthState {
    accessToken: string | undefined;
    refreshToken: string | undefined;
}

interface AuthActions {
    login: (accessToken: string, refreshToken: string) => void;
    logout: () => void;
}

const ACCESS_TOKEN_COOKIE = "access_token";
const REFRESH_TOKEN_COOKIE = "refresh_token";

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
    accessToken: getCookie(ACCESS_TOKEN_COOKIE),
    refreshToken: getCookie(REFRESH_TOKEN_COOKIE),
    login: (accessToken, refreshToken) => {
        setCookie(ACCESS_TOKEN_COOKIE, accessToken, 7);
        setCookie(REFRESH_TOKEN_COOKIE, refreshToken, 7);
        set({ accessToken, refreshToken });
    },
    logout: () => {
        deleteCookie(ACCESS_TOKEN_COOKIE);
        deleteCookie(REFRESH_TOKEN_COOKIE);
        set({ accessToken: undefined, refreshToken: undefined });
    },
}));
