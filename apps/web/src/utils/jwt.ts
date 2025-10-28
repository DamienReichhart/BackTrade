import type { PublicUser } from "@backtrade/types";

/**
 * Decode JWT token without verification
 *
 * Note: This function does NOT verify the token signature.
 * Token verification should be done on the backend.
 *
 * @param token - JWT token string
 * @returns Decoded token payload or null if invalid
 */
export function decodeJWT(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Extract public user from JWT token
 *
 * Assumes the token's `sub` claim contains the PublicUser object
 *
 * @param token - JWT token string
 * @returns PublicUser object or null if not found
 */
export function getUserFromToken(token: string): PublicUser | null {
  const decoded = decodeJWT(token);
  if (!decoded?.sub) {
    return null;
  }

  // The sub claim contains the PublicUser object as a string
  try {
    const userJson =
      typeof decoded.sub === "string"
        ? decoded.sub
        : JSON.stringify(decoded.sub);
    const user = JSON.parse(userJson) as PublicUser;
    return user;
  } catch {
    return null;
  }
}
