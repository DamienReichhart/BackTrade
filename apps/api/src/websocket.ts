import { logger } from "./libs/pino";
import type { WebSocketServer, WebSocket } from "ws";

function setupWebSocket(wss: WebSocketServer): void {
    wss.on("connection", (ws: WebSocket) => {
        logger.info("WebSocket client connected");

        ws.on("message", (data: Buffer) => {
            try {
                const message = JSON.parse(data.toString());
                handleWebSocketMessage(ws, message);
            } catch {
                logger.warn("Invalid WebSocket message received");
                ws.send(JSON.stringify({ error: "Invalid message format" }));
            }
        });

        ws.on("close", () => {
            logger.info("WebSocket client disconnected");
        });

        ws.on("error", (error: Error) => {
            logger.error({ error: error.message }, "WebSocket error");
        });

        ws.send(JSON.stringify({ type: "connected", timestamp: Date.now() }));
    });

    wss.on("error", (error: Error) => {
        logger.error({ error: error.message }, "WebSocket server error");
    });
}

function handleWebSocketMessage(ws: WebSocket, message: unknown): void {
    // TODO: Implement message handling based on your protocol
    logger.debug({ message }, "WebSocket message received");
    ws.send(JSON.stringify({ type: "ack", received: message }));
}

export { setupWebSocket };
