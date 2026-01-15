/**
 * WebSocket Message Sender
 *
 * Handles outbound message serialization and delivery to WebSocket clients.
 * Provides utilities for sending messages to individual clients, broadcasting
 * to channels, and sending to all connections of a specific user.
 */

import type { WebSocket } from "ws";
import {
    type WsServerMessage,
    type WsErrorMessage,
    type WsConnectedMessage,
} from "@backtrade/types";
import { BaseService } from "../base/base-service";
import { wsConnectionService, type WsClientConnection } from "./services";

/**
 * WebSocket Message Sender
 *
 * Responsibilities:
 * - Serialize and send messages to clients
 * - Provide broadcast and multicast utilities
 * - Handle send failures gracefully
 */
class WsMessageSender extends BaseService {
    constructor() {
        super("ws-message-sender");
    }

    /**
     * Send a message to a specific WebSocket
     *
     * @param socket - WebSocket to send to
     * @param message - Message to send
     * @returns True if message was sent successfully
     */
    send(socket: WebSocket, message: WsServerMessage): boolean {
        try {
            if (socket.readyState !== socket.OPEN) {
                this.logger.trace("Cannot send message: socket not open");
                return false;
            }

            socket.send(JSON.stringify(message));
            return true;
        } catch (error) {
            this.logger.warn(
                {
                    error:
                        error instanceof Error ? error.message : String(error),
                },
                "Failed to send WebSocket message"
            );
            return false;
        }
    }

    /**
     * Send a message to a connection by connection object
     *
     * @param connection - Client connection to send to
     * @param message - Message to send
     * @returns True if message was sent successfully
     */
    sendToConnection(
        connection: WsClientConnection,
        message: WsServerMessage
    ): boolean {
        return this.send(connection.socket, message);
    }

    /**
     * Send an error message to a WebSocket
     *
     * @param socket - WebSocket to send to
     * @param code - Error code
     * @param message - Error message
     * @param details - Optional additional details
     */
    sendError(
        socket: WebSocket,
        code: number,
        message: string,
        details?: Record<string, unknown>
    ): void {
        const errorMessage: WsErrorMessage = {
            type: "error",
            payload: {
                code,
                message,
                ...(details && { details }),
            },
        };
        this.send(socket, errorMessage);
    }

    /**
     * Send the initial connected message to a new connection
     *
     * @param connection - Newly established connection
     */
    sendConnected(connection: WsClientConnection): void {
        const message: WsConnectedMessage = {
            type: "connected",
            payload: {
                connectionId: connection.connectionId,
                timestamp: Date.now(),
                authTimeoutMs: wsConnectionService.authTimeoutMs,
            },
        };
        this.send(connection.socket, message);
    }

    /**
     * Broadcast a message to all connections subscribed to a channel
     *
     * @param channel - Channel name
     * @param message - Message to broadcast
     * @returns Number of messages successfully sent
     */
    broadcast(channel: string, message: WsServerMessage): number {
        const subscribers = wsConnectionService.getChannelSubscribers(channel);
        let sentCount = 0;

        for (const connection of subscribers) {
            if (this.send(connection.socket, message)) {
                sentCount++;
            }
        }

        this.logger.trace(
            { channel, subscriberCount: subscribers.length, sentCount },
            "Broadcast message sent"
        );

        return sentCount;
    }

    /**
     * Send a message to all connections for a specific user
     *
     * @param userId - User ID
     * @param message - Message to send
     * @returns Number of messages successfully sent
     */
    sendToUser(userId: number, message: WsServerMessage): number {
        const connections = wsConnectionService.getUserConnections(userId);
        let sentCount = 0;

        for (const connection of connections) {
            if (this.send(connection.socket, message)) {
                sentCount++;
            }
        }

        return sentCount;
    }

    /**
     * Send a message to all authenticated connections
     *
     * @param message - Message to send
     * @returns Number of messages successfully sent
     */
    broadcastToAll(message: WsServerMessage): number {
        const connections = wsConnectionService.getAuthenticatedConnections();
        let sentCount = 0;

        for (const connection of connections) {
            if (this.send(connection.socket, message)) {
                sentCount++;
            }
        }

        this.logger.trace(
            { totalConnections: connections.length, sentCount },
            "Broadcast to all sent"
        );

        return sentCount;
    }
}

export default new WsMessageSender();
