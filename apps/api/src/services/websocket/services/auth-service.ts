/**
 * WebSocket Authentication Service
 *
 * Handles JWT token verification and user validation for WebSocket connections.
 * Provides secure authentication with proper error handling and logging.
 */

import {
    WebSocketCloseCode,
    type User,
    type JwtPayload,
} from "@backtrade/types";
import jwtService from "../../security/jwt-service";
import usersService from "../../base/users-service";
import { BaseService } from "../../base/base-service";

/**
 * Authentication result types
 */
export interface AuthenticationSuccess {
    success: true;
    user: User;
    payload: JwtPayload;
}

export interface AuthenticationFailure {
    success: false;
    closeCode: WebSocketCloseCode;
    message: string;
}

export type AuthenticationResult =
    | AuthenticationSuccess
    | AuthenticationFailure;

/**
 * WebSocket Authentication Service
 *
 * Responsible for:
 * - Extracting and validating Bearer tokens
 * - Verifying JWT tokens
 * - Fetching and validating user accounts
 * - Checking user ban status
 */
class WsAuthService extends BaseService {
    constructor() {
        super("ws-auth-service");
    }

    /**
     * Extract token from Bearer authorization string
     *
     * Supports both "Bearer <token>" format and raw token
     *
     * @param authString - Authorization string or raw token
     * @returns Extracted token or null if invalid
     */
    extractToken(authString: string | undefined | null): string | null {
        if (!authString || typeof authString !== "string") {
            return null;
        }

        const trimmed = authString.trim();

        // Handle "Bearer <token>" format
        if (trimmed.toLowerCase().startsWith("bearer ")) {
            const token = trimmed.slice(7).trim();
            return token.length > 0 ? token : null;
        }

        // Handle raw token format
        return trimmed.length > 0 ? trimmed : null;
    }

    /**
     * Authenticate a WebSocket connection using JWT token
     *
     * This method performs the complete authentication flow:
     * 1. Extracts token from authorization string
     * 2. Verifies JWT signature and expiration
     * 3. Fetches user from database
     * 4. Validates user is not banned
     *
     * @param authString - Authorization string containing Bearer token
     * @param connectionId - Connection identifier for logging
     * @returns Authentication result with user or error details
     */
    async authenticate(
        authString: string | undefined | null,
        connectionId: string
    ): Promise<AuthenticationResult> {
        this.logger.trace(
            { connectionId },
            "Starting WebSocket authentication"
        );

        // Extract token
        const token = this.extractToken(authString);
        if (!token) {
            this.logger.debug(
                { connectionId },
                "Authentication failed: No valid token provided"
            );
            return {
                success: false,
                closeCode: WebSocketCloseCode.AUTHENTICATION_REQUIRED,
                message: "Authentication token is required",
            };
        }

        // Verify JWT
        let payload: JwtPayload;
        try {
            payload = await jwtService.verifyAccessToken(token);
        } catch (error) {
            const isExpired =
                error instanceof Error && error.message.includes("expired");

            this.logger.debug(
                {
                    connectionId,
                    error:
                        error instanceof Error ? error.message : String(error),
                },
                "Authentication failed: Invalid token"
            );

            return {
                success: false,
                closeCode: isExpired
                    ? WebSocketCloseCode.TOKEN_EXPIRED
                    : WebSocketCloseCode.AUTHENTICATION_FAILED,
                message: isExpired
                    ? "Authentication token has expired"
                    : "Invalid authentication token",
            };
        }

        // Fetch user
        let user: User;
        try {
            user = await usersService.getUserById(payload.sub);
        } catch (error) {
            this.logger.warn(
                {
                    connectionId,
                    userId: payload.sub,
                    error:
                        error instanceof Error ? error.message : String(error),
                },
                "Authentication failed: User not found"
            );
            return {
                success: false,
                closeCode: WebSocketCloseCode.AUTHENTICATION_FAILED,
                message: "User account not found",
            };
        }

        // Check ban status
        if (user.is_banned) {
            this.logger.warn(
                { connectionId, userId: user.id },
                "Authentication failed: User is banned"
            );
            return {
                success: false,
                closeCode: WebSocketCloseCode.USER_BANNED,
                message: "Your account has been banned",
            };
        }

        this.logger.debug(
            { connectionId, userId: user.id },
            "WebSocket authentication successful"
        );

        return {
            success: true,
            user,
            payload,
        };
    }

    /**
     * Refresh authentication with a new token
     *
     * Used when client sends a refresh_token message to update
     * their authentication before the current token expires.
     *
     * @param authString - New authorization string with Bearer token
     * @param currentUserId - The currently authenticated user's ID
     * @param connectionId - Connection identifier for logging
     * @returns Authentication result
     */
    async refreshAuthentication(
        authString: string | undefined | null,
        currentUserId: number,
        connectionId: string
    ): Promise<AuthenticationResult> {
        this.logger.trace(
            { connectionId, userId: currentUserId },
            "Refreshing WebSocket authentication"
        );

        const result = await this.authenticate(authString, connectionId);

        // Ensure the refreshed token belongs to the same user
        if (result.success && result.user.id !== currentUserId) {
            this.logger.warn(
                {
                    connectionId,
                    currentUserId,
                    newUserId: result.user.id,
                },
                "Token refresh rejected: User ID mismatch"
            );
            return {
                success: false,
                closeCode: WebSocketCloseCode.AUTHENTICATION_FAILED,
                message: "Token does not belong to current user",
            };
        }

        return result;
    }
}

export default new WsAuthService();
