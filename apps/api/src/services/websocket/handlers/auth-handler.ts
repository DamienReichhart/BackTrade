/**
 * WebSocket Authentication Handler
 *
 * Handles authenticate and refresh_token messages.
 */

import {
    WebSocketCloseCode,
    WsConnectionState,
    type WsAuthenticatedMessage,
    type WsTokenRefreshedMessage,
} from "@backtrade/types";
import { BaseService } from "../../base/base-service";
import {
    wsAuthService,
    wsConnectionService,
    type WsClientConnection,
} from "../services";
import wsMessageSender from "../message-sender";

/**
 * Authentication Handler
 *
 * Responsibilities:
 * - Process authenticate messages
 * - Process refresh_token messages
 * - Coordinate with auth service and connection service
 */
class WsAuthHandler extends BaseService {
    constructor() {
        super("ws-auth-handler");
    }

    /**
     * Handle authentication request
     *
     * @param connection - Client connection
     * @param token - JWT token (without Bearer prefix)
     */
    async handleAuthenticate(
        connection: WsClientConnection,
        token: string
    ): Promise<void> {
        const { connectionId, socket, state } = connection;

        // Prevent re-authentication
        if (state === WsConnectionState.AUTHENTICATED) {
            wsMessageSender.sendError(
                socket,
                WebSocketCloseCode.AUTHENTICATION_FAILED,
                "Already authenticated"
            );
            return;
        }

        // Update state to authenticating
        connection.state = WsConnectionState.AUTHENTICATING;

        // Authenticate using auth service
        const result = await wsAuthService.authenticate(
            `Bearer ${token}`,
            connectionId
        );

        if (!result.success) {
            // Send error before closing
            wsMessageSender.sendError(socket, result.closeCode, result.message);

            // Close connection
            wsConnectionService.closeConnection(
                connectionId,
                result.closeCode,
                result.message
            );
            return;
        }

        // Calculate token expiration in ms
        const tokenExpiresAt = result.payload.exp * 1000;

        // Update connection service
        wsConnectionService.authenticateConnection(
            connectionId,
            result.user,
            tokenExpiresAt
        );

        // Send success response
        const response: WsAuthenticatedMessage = {
            type: "authenticated",
            payload: {
                userId: result.user.id,
                expiresAt: tokenExpiresAt,
            },
        };
        wsMessageSender.send(socket, response);

        this.logger.debug(
            { connectionId, userId: result.user.id },
            "Client authenticated successfully"
        );
    }

    /**
     * Handle token refresh request
     *
     * @param connection - Client connection
     * @param token - New JWT token (without Bearer prefix)
     */
    async handleRefreshToken(
        connection: WsClientConnection,
        token: string
    ): Promise<void> {
        const { connectionId, socket, user } = connection;

        if (!user) {
            wsMessageSender.sendError(
                socket,
                WebSocketCloseCode.AUTHENTICATION_REQUIRED,
                "Not authenticated"
            );
            return;
        }

        // Verify new token
        const result = await wsAuthService.refreshAuthentication(
            `Bearer ${token}`,
            user.id,
            connectionId
        );

        if (!result.success) {
            wsMessageSender.sendError(socket, result.closeCode, result.message);
            return;
        }

        // Update expiration
        const tokenExpiresAt = result.payload.exp * 1000;
        wsConnectionService.refreshAuthentication(connectionId, tokenExpiresAt);

        // Send confirmation
        const response: WsTokenRefreshedMessage = {
            type: "token_refreshed",
            payload: {
                expiresAt: tokenExpiresAt,
            },
        };
        wsMessageSender.send(socket, response);

        this.logger.debug(
            { connectionId, userId: user.id },
            "Token refreshed successfully"
        );
    }
}

export default new WsAuthHandler();
