import type { WebSocketServer, WebSocket, RawData } from "ws";
import { logger } from "./libs/pino";
import {
    wsConnectionService,
    wsMessageRouter,
    wsMessageSender,
} from "./services/websocket";

const wsLogger = logger.child({ service: "websocket" });

/**
 * Setup WebSocket server with all handlers
 *
 * @param wss - WebSocket server instance
 */
function setupWebSocket(wss: WebSocketServer): void {
    // Start connection service
    wsConnectionService.start();

    // Handle new connections
    wss.on("connection", handleConnection);

    // Handle server errors
    wss.on("error", (error: Error) => {
        wsLogger.error({ error: error.message }, "WebSocket server error");
    });

    wsLogger.info("WebSocket server initialized with authentication support");
}

/**
 * Handle new WebSocket connection
 *
 * @param socket - New WebSocket client
 */
function handleConnection(socket: WebSocket): void {
    // Register connection and get metadata
    const connection = wsConnectionService.registerConnection(socket);
    const { connectionId } = connection;

    wsLogger.debug({ connectionId }, "New WebSocket connection established");

    // Send connected message with auth timeout info
    wsMessageSender.sendConnected(connection);

    // Handle incoming messages
    socket.on("message", async (data: RawData) => {
        try {
            // Get fresh connection reference (state may have changed)
            const currentConnection =
                wsConnectionService.getConnection(connectionId);
            if (!currentConnection) {
                wsLogger.warn(
                    { connectionId },
                    "Message received for unknown connection"
                );
                return;
            }

            await wsMessageRouter.routeMessage(currentConnection, data);
        } catch (error) {
            wsLogger.error(
                {
                    connectionId,
                    error:
                        error instanceof Error ? error.message : String(error),
                },
                "Error handling WebSocket message"
            );
        }
    });

    // Handle connection close
    socket.on("close", (code: number, reason: Buffer) => {
        wsLogger.debug(
            {
                connectionId,
                code,
                reason: reason.toString("utf-8"),
            },
            "WebSocket connection closed"
        );

        // Cleanup connection
        wsConnectionService.removeConnection(connectionId);
    });

    // Handle connection errors
    socket.on("error", (error: Error) => {
        wsLogger.error(
            { connectionId, error: error.message },
            "WebSocket connection error"
        );

        // Cleanup connection on error
        wsConnectionService.removeConnection(connectionId);
    });
}

/**
 * Cleanup WebSocket server on shutdown
 *
 * @param wss - WebSocket server instance
 */
function cleanupWebSocket(wss: WebSocketServer): void {
    wsLogger.info("Cleaning up WebSocket server");

    // Stop connection service (will close all connections gracefully)
    wsConnectionService.stop();

    // Close the server
    wss.close(() => {
        wsLogger.info("WebSocket server closed");
    });
}

/**
 * Get WebSocket server statistics
 */
function getWebSocketStats(): {
    totalConnections: number;
    authenticatedConnections: number;
    uniqueUsers: number;
    totalSubscriptions: number;
} {
    return wsConnectionService.getStats();
}

export { setupWebSocket, cleanupWebSocket, getWebSocketStats };
