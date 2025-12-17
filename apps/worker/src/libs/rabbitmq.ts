import { createConsumer, type Consumer } from "@backtrade/queue";
import type { QueueMessage } from "@backtrade/types";
import { ENV } from "../config/env";
import { logger } from "./pino";

const rabbitmqLogger = logger.child({
    service: "rabbitmq",
});

/**
 * RabbitMQ consumer instance
 * Created as a singleton to share connection across the application
 */
let consumerInstance: Consumer<QueueMessage> | null = null;

/**
 * Gets or creates the RabbitMQ consumer instance
 */
function getConsumer(): Consumer<QueueMessage> {
    consumerInstance ??= createConsumer<QueueMessage>({
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
        consumer: {
            prefetch: 1, // Process one message at a time
            noAck: false, // Manual acknowledgment
            requeueOnError: true, // Requeue on error
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
    return consumerInstance;
}

/**
 * Connects to RabbitMQ (initializes the consumer and ensures connection)
 */
export async function connect(): Promise<void> {
    const consumer = getConsumer();
    await consumer.connect();
}

/**
 * Consumes messages from the queue
 *
 * @param onMessage - Message handler function
 */
export async function consumeMessages(
    onMessage: (message: QueueMessage) => Promise<void>
): Promise<void> {
    const consumer = getConsumer();
    await consumer.consume(onMessage);
}

/**
 * Closes the RabbitMQ connection
 */
export async function close(): Promise<void> {
    if (consumerInstance) {
        await consumerInstance.close();
        consumerInstance = null;
    }
}
