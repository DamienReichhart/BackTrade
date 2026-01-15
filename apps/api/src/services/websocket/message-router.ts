/**
 * WebSocket Message Router
 *
 * Routes incoming WebSocket messages to appropriate handlers.
 * Handles message parsing, validation, and authentication checks.
 */

import {
    WebSocketCloseCode,
    WsClientMessageSchema,
    WsConnectionState,
    type WsClientMessage,
} from "@backtrade/types";
import { BaseService } from "../base/base-service";
import { wsConnectionService, type WsClientConnection } from "./services";
import wsMessageSender from "./message-sender";
import {
    wsAuthHandler,
    wsSubscriptionHandler,
    wsHeartbeatHandler,
} from "./handlers";

/**
 * WebSocket Message Router
 *
 * Responsibilities:
 * - Parse and validate incoming messages
 * - Check authentication requirements
 * - Route messages to appropriate handlers
 */
class WsMessageRouter extends BaseService {
    constructor() {
        super("ws-message-router");
    }

    /**
     * Process an incoming WebSocket message
     *
     * @param connection - Client connection that sent the message
     * @param rawData - Raw message data (Buffer, ArrayBuffer, Buffer[], or string)
     */
    async routeMessage(
        connection: WsClientConnection,
        rawData: Buffer | ArrayBuffer | Buffer[] | string
    ): Promise<void> {
        const { connectionId, socket } = connection;

        // Update activity timestamp
        wsConnectionService.updateActivity(connectionId);

        // Parse JSON
        const parsed = this.parseRawData(rawData);
        if (parsed === null) {
            this.logger.debug(
                { connectionId },
                "Invalid JSON message received"
            );
            wsMessageSender.sendError(
                socket,
                WebSocketCloseCode.INVALID_MESSAGE_FORMAT,
                "Invalid JSON format"
            );
            return;
        }

        // Validate message schema
        const validation = WsClientMessageSchema.safeParse(parsed);
        if (!validation.success) {
            const issues = validation.error.issues;
            this.logger.debug(
                {
                    connectionId,
                    errors: issues,
                },
                "Invalid message schema"
            );
            wsMessageSender.sendError(
                socket,
                WebSocketCloseCode.INVALID_MESSAGE_FORMAT,
                "Invalid message format",
                { errors: issues.map((issue) => issue.message) }
            );
            return;
        }

        const message = validation.data;

        // Check authentication requirements and route to handler
        await this.dispatchMessage(connection, message);
    }

    /**
     * Parse raw WebSocket data into JSON
     *
     * @param rawData - Raw message data
     * @returns Parsed JSON or null if invalid
     */
    private parseRawData(
        rawData: Buffer | ArrayBuffer | Buffer[] | string
    ): unknown {
        try {
            let dataString: string;
            if (typeof rawData === "string") {
                dataString = rawData;
            } else if (Buffer.isBuffer(rawData)) {
                dataString = rawData.toString("utf-8");
            } else if (rawData instanceof ArrayBuffer) {
                dataString = Buffer.from(rawData).toString("utf-8");
            } else if (Array.isArray(rawData)) {
                dataString = Buffer.concat(rawData).toString("utf-8");
            } else {
                dataString = String(rawData);
            }
            return JSON.parse(dataString);
        } catch {
            return null;
        }
    }

    /**
     * Dispatch a validated message to its handler
     *
     * @param connection - Client connection
     * @param message - Validated message
     */
    private async dispatchMessage(
        connection: WsClientConnection,
        message: WsClientMessage
    ): Promise<void> {
        const { connectionId, state, socket } = connection;

        // Check authentication for non-auth messages
        if (
            message.type !== "authenticate" &&
            state !== WsConnectionState.AUTHENTICATED
        ) {
            this.logger.debug(
                { connectionId, messageType: message.type },
                "Unauthenticated message rejected"
            );
            wsMessageSender.sendError(
                socket,
                WebSocketCloseCode.AUTHENTICATION_REQUIRED,
                "Authentication required"
            );
            return;
        }

        // Route to specific handler
        switch (message.type) {
            case "authenticate":
                await wsAuthHandler.handleAuthenticate(
                    connection,
                    message.payload.token
                );
                break;

            case "refresh_token":
                await wsAuthHandler.handleRefreshToken(
                    connection,
                    message.payload.token
                );
                break;

            case "ping":
                wsHeartbeatHandler.handlePing(
                    connection,
                    message.payload.timestamp
                );
                break;

            case "subscribe":
                wsSubscriptionHandler.handleSubscribe(
                    connection,
                    message.payload.channel,
                    message.payload.params
                );
                break;

            case "unsubscribe":
                wsSubscriptionHandler.handleUnsubscribe(
                    connection,
                    message.payload.channel
                );
                break;

            default:
                // TypeScript exhaustiveness check
                const _exhaustive: never = message;
                this.logger.warn(
                    { connectionId, message: _exhaustive },
                    "Unknown message type"
                );
        }
    }
}

export default new WsMessageRouter();
