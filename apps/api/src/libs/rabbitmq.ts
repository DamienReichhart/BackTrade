import { createPublisher, type Publisher } from "@backtrade/queue";
import { ENV } from "../config/env";
import { logger } from "./pino";

const rabbitmqLogger = logger.child({
    service: "rabbitmq",
});

/**
 * RabbitMQ publisher instance
 * Created as a singleton to share connection across the application
 */
let publisherInstance: Publisher | null = null;

/**
 * Gets or creates the RabbitMQ publisher instance
 */
function getPublisher(): Publisher {
    publisherInstance ??= createPublisher({
        connection: {
            host: ENV.RABBITMQ_HOST,
            port: ENV.RABBITMQ_PORT,
            username: ENV.RABBITMQ_USER,
            password: ENV.RABBITMQ_PASSWORD,
        },
        queue: {
            name: ENV.RABBITMQ_QUEUE_NAME,
            durable: true,
        },
        publisher: {
            persistent: true,
        },
        logger: {
            info: (message: string, meta?: Record<string, unknown>) =>
                rabbitmqLogger.info(meta, message),
            error: (
                error: unknown,
                message: string,
                meta?: Record<string, unknown>
            ) => rabbitmqLogger.error(error, message, meta),
            warn: (message: string, meta?: Record<string, unknown>) =>
                rabbitmqLogger.warn(meta, message),
            debug: (message: string, meta?: Record<string, unknown>) =>
                rabbitmqLogger.debug(meta, message),
            trace: (message: string, meta?: Record<string, unknown>) =>
                rabbitmqLogger.trace(meta, message),
        },
    });
    return publisherInstance;
}

/**
 * Publishes a message to the queue
 *
 * @param message - The message to publish
 */
export async function publishMessage(message: unknown): Promise<void> {
    const publisher = getPublisher();
    await publisher.publish(message);
}

/**
 * Checks if RabbitMQ connection is healthy
 *
 * @returns Promise resolving to true if connection is available, false otherwise
 */
export async function checkConnection(): Promise<boolean> {
    try {
        const publisher = getPublisher();
        return publisher.isHealthy();
    } catch {
        return false;
    }
}

/**
 * Closes the RabbitMQ connection
 */
export async function close(): Promise<void> {
    if (publisherInstance) {
        await publisherInstance.close();
        publisherInstance = null;
    }
}
