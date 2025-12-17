import { logger } from "./libs/pino";
import { connect, consumeMessages, close } from "./libs/rabbitmq";
import messageProcessor from "./processor/message-processor";

const workerLogger = logger.child({
    module: "worker",
});

/**
 * Main worker function
 */
async function startWorker(): Promise<void> {
    try {
        workerLogger.info("Starting data worker...");

        // Connect to RabbitMQ
        await connect();

        // Start consuming messages
        await consumeMessages(async (message) => {
            await messageProcessor.processMessage(
                message as Parameters<typeof messageProcessor.processMessage>[0]
            );
        });

        workerLogger.info("Data worker started and ready to process messages");
    } catch (err) {
        workerLogger.error(err, "Failed to start worker");
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
    workerLogger.info("Received SIGINT, shutting down gracefully...");
    await close();
    process.exit(0);
});

process.on("SIGTERM", async () => {
    workerLogger.info("Received SIGTERM, shutting down gracefully...");
    await close();
    process.exit(0);
});

// Start the worker
void startWorker();
