/**
 * WebSocket Connection Service
 *
 * Manages WebSocket client connections, authentication state, and subscriptions.
 * Handles connection lifecycle including authentication timeouts and cleanup.
 */

import type { WebSocket } from "ws";
import {
    WebSocketCloseCode,
    WsConnectionState,
    type User,
} from "@backtrade/types";
import { BaseService } from "../../base/base-service";
import { randomUUID } from "crypto";

/**
 * Extended WebSocket with connection metadata
 */
export interface WsClientConnection {
    /** Unique connection identifier */
    connectionId: string;
    /** Raw WebSocket instance */
    socket: WebSocket;
    /** Current connection state */
    state: WsConnectionState;
    /** Authenticated user (null if not authenticated) */
    user: User | null;
    /** Token expiration timestamp (ms) */
    tokenExpiresAt: number | null;
    /** Connection established timestamp (ms) */
    connectedAt: number;
    /** Authentication timestamp (ms, null if not authenticated) */
    authenticatedAt: number | null;
    /** Last activity timestamp (ms) */
    lastActivityAt: number;
    /** Active channel subscriptions */
    subscriptions: Set<string>;
    /** Authentication timeout handle */
    authTimeoutHandle: NodeJS.Timeout | null;
}

/**
 * Configuration for connection service
 */
export interface WsConnectionServiceConfig {
    /** Time (ms) allowed for client to authenticate after connecting */
    authTimeoutMs: number;
    /** Interval (ms) for heartbeat checks */
    heartbeatIntervalMs: number;
    /** Time (ms) without activity before connection is considered stale */
    staleConnectionTimeoutMs: number;
}

const DEFAULT_CONFIG: WsConnectionServiceConfig = {
    authTimeoutMs: 10_000, // 10 seconds to authenticate
    heartbeatIntervalMs: 30_000, // 30 second heartbeat interval
    staleConnectionTimeoutMs: 60_000, // 60 seconds without activity
};

/**
 * WebSocket Connection Service
 *
 * Responsibilities:
 * - Track all active WebSocket connections
 * - Manage authentication state and timeouts
 * - Handle connection subscriptions
 * - Provide lookup methods for broadcasting
 * - Clean up stale connections
 */
class WsConnectionService extends BaseService {
    /** Map of connection ID to client connection */
    private readonly connections: Map<string, WsClientConnection> = new Map();

    /** Map of user ID to their connection IDs (supports multiple connections per user) */
    private readonly userConnections: Map<number, Set<string>> = new Map();

    /** Map of channel to subscribed connection IDs */
    private readonly channelSubscriptions: Map<string, Set<string>> = new Map();

    /** Service configuration */
    private readonly config: WsConnectionServiceConfig;

    /** Stale connection cleanup interval handle */
    private cleanupIntervalHandle: NodeJS.Timeout | null = null;

    constructor(config: Partial<WsConnectionServiceConfig> = {}) {
        super("ws-connection-service");
        this.config = { ...DEFAULT_CONFIG, ...config };
    }

    /**
     * Get the authentication timeout configuration
     */
    get authTimeoutMs(): number {
        return this.config.authTimeoutMs;
    }

    /**
     * Start the connection service
     *
     * Initializes periodic cleanup of stale connections
     */
    start(): void {
        if (this.cleanupIntervalHandle) {
            return;
        }

        this.cleanupIntervalHandle = setInterval(() => {
            this.cleanupStaleConnections();
        }, this.config.heartbeatIntervalMs);

        this.logger.info("WebSocket connection service started");
    }

    /**
     * Stop the connection service
     *
     * Clears cleanup interval and disconnects all clients
     */
    stop(): void {
        if (this.cleanupIntervalHandle) {
            clearInterval(this.cleanupIntervalHandle);
            this.cleanupIntervalHandle = null;
        }

        // Close all connections gracefully
        for (const connection of this.connections.values()) {
            this.closeConnection(
                connection.connectionId,
                WebSocketCloseCode.SERVER_SHUTDOWN,
                "Server shutting down"
            );
        }

        this.logger.info("WebSocket connection service stopped");
    }

    /**
     * Register a new WebSocket connection
     *
     * Creates connection metadata and starts authentication timeout
     *
     * @param socket - Raw WebSocket instance
     * @returns The created client connection
     */
    registerConnection(socket: WebSocket): WsClientConnection {
        const connectionId = randomUUID();
        const now = Date.now();

        const connection: WsClientConnection = {
            connectionId,
            socket,
            state: WsConnectionState.CONNECTED,
            user: null,
            tokenExpiresAt: null,
            connectedAt: now,
            authenticatedAt: null,
            lastActivityAt: now,
            subscriptions: new Set(),
            authTimeoutHandle: null,
        };

        // Start authentication timeout
        connection.authTimeoutHandle = setTimeout(() => {
            this.handleAuthTimeout(connectionId);
        }, this.config.authTimeoutMs);

        this.connections.set(connectionId, connection);

        this.logger.debug(
            { connectionId, totalConnections: this.connections.size },
            "New WebSocket connection registered"
        );

        return connection;
    }

    /**
     * Handle authentication timeout
     *
     * Called when client doesn't authenticate within the allowed time
     */
    private handleAuthTimeout(connectionId: string): void {
        const connection = this.connections.get(connectionId);
        if (!connection) {
            return;
        }

        // Only timeout if still not authenticated
        if (connection.state !== WsConnectionState.AUTHENTICATED) {
            this.logger.debug(
                { connectionId },
                "Connection authentication timeout"
            );
            this.closeConnection(
                connectionId,
                WebSocketCloseCode.AUTHENTICATION_TIMEOUT,
                "Authentication timeout"
            );
        }
    }

    /**
     * Mark a connection as authenticated
     *
     * Updates connection state and creates user-to-connection mapping
     *
     * @param connectionId - Connection to authenticate
     * @param user - Authenticated user
     * @param tokenExpiresAt - Token expiration timestamp (ms)
     */
    authenticateConnection(
        connectionId: string,
        user: User,
        tokenExpiresAt: number
    ): void {
        const connection = this.connections.get(connectionId);
        if (!connection) {
            this.logger.warn(
                { connectionId },
                "Attempted to authenticate non-existent connection"
            );
            return;
        }

        // Clear auth timeout
        if (connection.authTimeoutHandle) {
            clearTimeout(connection.authTimeoutHandle);
            connection.authTimeoutHandle = null;
        }

        // Update connection state
        connection.state = WsConnectionState.AUTHENTICATED;
        connection.user = user;
        connection.tokenExpiresAt = tokenExpiresAt;
        connection.authenticatedAt = Date.now();
        connection.lastActivityAt = Date.now();

        // Add to user connections map
        let userConns = this.userConnections.get(user.id);
        if (!userConns) {
            userConns = new Set();
            this.userConnections.set(user.id, userConns);
        }
        userConns.add(connectionId);

        this.logger.debug(
            {
                connectionId,
                userId: user.id,
                userConnectionCount: userConns.size,
            },
            "Connection authenticated"
        );
    }

    /**
     * Update authentication after token refresh
     *
     * @param connectionId - Connection to update
     * @param tokenExpiresAt - New token expiration timestamp
     */
    refreshAuthentication(connectionId: string, tokenExpiresAt: number): void {
        const connection = this.connections.get(connectionId);
        if (connection?.state !== WsConnectionState.AUTHENTICATED) {
            return;
        }

        connection.tokenExpiresAt = tokenExpiresAt;
        connection.lastActivityAt = Date.now();

        this.logger.trace(
            { connectionId, userId: connection.user?.id, tokenExpiresAt },
            "Connection authentication refreshed"
        );
    }

    /**
     * Update last activity timestamp for a connection
     *
     * @param connectionId - Connection to update
     */
    updateActivity(connectionId: string): void {
        const connection = this.connections.get(connectionId);
        if (connection) {
            connection.lastActivityAt = Date.now();
        }
    }

    /**
     * Subscribe a connection to a channel
     *
     * @param connectionId - Connection to subscribe
     * @param channel - Channel name
     * @returns True if subscription was successful
     */
    subscribe(connectionId: string, channel: string): boolean {
        const connection = this.connections.get(connectionId);
        if (connection?.state !== WsConnectionState.AUTHENTICATED) {
            return false;
        }

        // Add to connection's subscriptions
        connection.subscriptions.add(channel);

        // Add to channel's subscriber list
        let channelSubs = this.channelSubscriptions.get(channel);
        if (!channelSubs) {
            channelSubs = new Set();
            this.channelSubscriptions.set(channel, channelSubs);
        }
        channelSubs.add(connectionId);

        this.logger.trace(
            {
                connectionId,
                userId: connection.user?.id,
                channel,
                subscriberCount: channelSubs.size,
            },
            "Connection subscribed to channel"
        );

        return true;
    }

    /**
     * Unsubscribe a connection from a channel
     *
     * @param connectionId - Connection to unsubscribe
     * @param channel - Channel name
     * @returns True if unsubscription was successful
     */
    unsubscribe(connectionId: string, channel: string): boolean {
        const connection = this.connections.get(connectionId);
        if (!connection) {
            return false;
        }

        // Remove from connection's subscriptions
        connection.subscriptions.delete(channel);

        // Remove from channel's subscriber list
        const channelSubs = this.channelSubscriptions.get(channel);
        if (channelSubs) {
            channelSubs.delete(connectionId);
            if (channelSubs.size === 0) {
                this.channelSubscriptions.delete(channel);
            }
        }

        this.logger.trace(
            { connectionId, userId: connection.user?.id, channel },
            "Connection unsubscribed from channel"
        );

        return true;
    }

    /**
     * Close a connection with a specific close code and reason
     *
     * @param connectionId - Connection to close
     * @param closeCode - WebSocket close code
     * @param reason - Close reason message
     */
    closeConnection(
        connectionId: string,
        closeCode: WebSocketCloseCode,
        reason: string
    ): void {
        const connection = this.connections.get(connectionId);
        if (!connection) {
            return;
        }

        // Clear auth timeout if pending
        if (connection.authTimeoutHandle) {
            clearTimeout(connection.authTimeoutHandle);
        }

        // Update state
        connection.state = WsConnectionState.DISCONNECTING;

        // Close socket
        try {
            connection.socket.close(closeCode, reason);
        } catch (error) {
            this.logger.warn(
                {
                    connectionId,
                    error:
                        error instanceof Error ? error.message : String(error),
                },
                "Error closing WebSocket"
            );
        }

        this.removeConnection(connectionId);
    }

    /**
     * Remove a connection from all tracking structures
     *
     * @param connectionId - Connection to remove
     */
    removeConnection(connectionId: string): void {
        const connection = this.connections.get(connectionId);
        if (!connection) {
            return;
        }

        // Remove from user connections
        if (connection.user) {
            const userConns = this.userConnections.get(connection.user.id);
            if (userConns) {
                userConns.delete(connectionId);
                if (userConns.size === 0) {
                    this.userConnections.delete(connection.user.id);
                }
            }
        }

        // Remove from all channel subscriptions
        for (const channel of connection.subscriptions) {
            const channelSubs = this.channelSubscriptions.get(channel);
            if (channelSubs) {
                channelSubs.delete(connectionId);
                if (channelSubs.size === 0) {
                    this.channelSubscriptions.delete(channel);
                }
            }
        }

        // Clear auth timeout if still pending
        if (connection.authTimeoutHandle) {
            clearTimeout(connection.authTimeoutHandle);
        }

        // Remove from connections map
        this.connections.delete(connectionId);

        this.logger.debug(
            {
                connectionId,
                userId: connection.user?.id,
                totalConnections: this.connections.size,
            },
            "Connection removed"
        );
    }

    /**
     * Clean up stale connections
     *
     * Removes connections that haven't had activity within the timeout period
     */
    private cleanupStaleConnections(): void {
        const now = Date.now();
        const staleThreshold = now - this.config.staleConnectionTimeoutMs;
        let cleanedCount = 0;

        for (const [connectionId, connection] of this.connections) {
            // Check for token expiration on authenticated connections
            if (
                connection.state === WsConnectionState.AUTHENTICATED &&
                connection.tokenExpiresAt &&
                connection.tokenExpiresAt < now
            ) {
                this.logger.debug(
                    { connectionId, userId: connection.user?.id },
                    "Closing connection due to token expiration"
                );
                this.closeConnection(
                    connectionId,
                    WebSocketCloseCode.TOKEN_EXPIRED,
                    "Authentication token expired"
                );
                cleanedCount++;
                continue;
            }

            // Check for stale connections
            if (connection.lastActivityAt < staleThreshold) {
                this.logger.debug(
                    {
                        connectionId,
                        userId: connection.user?.id,
                        lastActivity: new Date(
                            connection.lastActivityAt
                        ).toISOString(),
                    },
                    "Closing stale connection"
                );
                this.closeConnection(
                    connectionId,
                    WebSocketCloseCode.GOING_AWAY,
                    "Connection timed out due to inactivity"
                );
                cleanedCount++;
            }
        }

        if (cleanedCount > 0) {
            this.logger.debug(
                { cleanedCount, remainingConnections: this.connections.size },
                "Stale connection cleanup completed"
            );
        }
    }

    // ============================================================================
    // QUERY METHODS
    // ============================================================================

    /**
     * Get a connection by ID
     */
    getConnection(connectionId: string): WsClientConnection | undefined {
        return this.connections.get(connectionId);
    }

    /**
     * Get all connections for a user
     */
    getUserConnections(userId: number): WsClientConnection[] {
        const connectionIds = this.userConnections.get(userId);
        if (!connectionIds) {
            return [];
        }

        return Array.from(connectionIds)
            .map((id) => this.connections.get(id))
            .filter((c): c is WsClientConnection => c !== undefined);
    }

    /**
     * Get all connections subscribed to a channel
     */
    getChannelSubscribers(channel: string): WsClientConnection[] {
        const connectionIds = this.channelSubscriptions.get(channel);
        if (!connectionIds) {
            return [];
        }

        return Array.from(connectionIds)
            .map((id) => this.connections.get(id))
            .filter((c): c is WsClientConnection => c !== undefined);
    }

    /**
     * Get all authenticated connections
     */
    getAuthenticatedConnections(): WsClientConnection[] {
        return Array.from(this.connections.values()).filter(
            (c) => c.state === WsConnectionState.AUTHENTICATED
        );
    }

    /**
     * Get connection statistics
     */
    getStats(): {
        totalConnections: number;
        authenticatedConnections: number;
        uniqueUsers: number;
        totalSubscriptions: number;
    } {
        return {
            totalConnections: this.connections.size,
            authenticatedConnections: this.getAuthenticatedConnections().length,
            uniqueUsers: this.userConnections.size,
            totalSubscriptions: this.channelSubscriptions.size,
        };
    }
}

// Export singleton instance with default config
export default new WsConnectionService();

// Also export class for custom configurations
export { WsConnectionService };
