import { type JwtPayload } from "@backtrade/types";

/**
 * Decode JWT token without verification
 *
 * Note: This function does NOT verify the token signature.
 * Token verification should be done on the backend.
 *
 * @param token - JWT token string
 * @returns Decoded token payload or null if invalid
 */
export function decodeJWT(token: string): JwtPayload | null {
    try {
        const parts = token.split(".");
        if (parts.length !== 3) {
            return null;
        }

        const payload = parts[1];
        const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
        return JSON.parse(decoded) as JwtPayload;
    } catch {
        return null;
    }
}

/**
 * Extract user ID from JWT token
 *
 * The token's `sub` claim contains the user ID (number).
 * To get full user data, call the /auth/me endpoint.
 *
 * @param token - JWT token string
 * @returns User ID or null if not found
 */
export function getUserIdFromToken(token: string): number | null {
    const decoded = decodeJWT(token);
    if (!decoded?.sub || typeof decoded.sub !== "number") {
        return null;
    }
    return decoded.sub;
}

/**
 * Check if a JWT token is expired
 *
 * @param token - JWT token string
 * @returns true if token is expired, false otherwise
 */
export function isTokenExpired(token: string): boolean {
    const decoded = decodeJWT(token);
    if (!decoded?.exp) {
        return true;
    }
    return decoded.exp * 1000 < Date.now();
}
