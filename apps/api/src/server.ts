import { ENV } from "./config/env";
import { createApp } from "./app";
import { logger } from "./libs/pino";

const { server, wss } = createApp();

server.listen(ENV.API_PORT, ENV.API_HOST, () => {
    logger.info(`API listening on http://${ENV.API_HOST}:${ENV.API_PORT}`);
    logger.info(
        `WebSocket server ready on ws://${ENV.API_HOST}:${ENV.API_PORT}`
    );
});

function gracefulShutdown(signal: string): void {
    logger.info(`${signal} received, shutting down gracefully`);

    wss.clients.forEach((client) => {
        client.close(1001, "Server shutting down");
    });

    wss.close(() => {
        logger.info("WebSocket server closed");
        server.close(() => {
            logger.info("HTTP server closed");
            process.exit(0);
        });
    });

    // Force exit if graceful shutdown takes too long
    setTimeout(() => {
        logger.warn("Forced shutdown after timeout");
        process.exit(1);
    }, 10_000);
}

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
