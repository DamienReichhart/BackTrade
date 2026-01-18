import {
    createConsumer,
    createPublisher,
    type Consumer,
    type Publisher,
} from "@backtrade/queue";
import type { QueueJobMessage } from "@backtrade/types";
import { ENV } from "../config/env";
import { logger } from "./pino";

const rabbitmqLogger = logger.child({
    service: "rabbitmq",
});

/**
 * Shared logger configuration for RabbitMQ
 */
const sharedLoggerConfig = {
    info: (message: string, meta?: Record<string, unknown>) =>
        rabbitmqLogger.info(meta, message),
    error: (error: unknown, message: string, meta?: Record<string, unknown>) =>
        rabbitmqLogger.error(error, message, meta),
    warn: (message: string, meta?: Record<string, unknown>) =>
        rabbitmqLogger.warn(meta, message),
    debug: (message: string, meta?: Record<string, unknown>) =>
        rabbitmqLogger.debug(meta, message),
    trace: (message: string, meta?: Record<string, unknown>) =>
        rabbitmqLogger.trace(meta, message),
};

/**
 * RabbitMQ consumer instance
 * Created as a singleton to share connection across the application
 */
let consumerInstance: Consumer<QueueJobMessage> | null = null;

/**
 * RabbitMQ publisher instance
 * Created as a singleton for publishing new jobs from processors
 */
let publisherInstance: Publisher | null = null;

/**
 * Gets or creates the RabbitMQ consumer instance
 */
function getConsumer(): Consumer<QueueJobMessage> {
    consumerInstance ??= createConsumer<QueueJobMessage>({
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
        logger: sharedLoggerConfig,
    });
    return consumerInstance;
}

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
        logger: sharedLoggerConfig,
    });
    return publisherInstance;
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
    onMessage: (message: QueueJobMessage) => Promise<void>
): Promise<void> {
    const consumer = getConsumer();
    await consumer.consume(onMessage);
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
 * Closes the RabbitMQ connections (consumer and publisher)
 */
export async function close(): Promise<void> {
    if (consumerInstance) {
        await consumerInstance.close();
        consumerInstance = null;
    }
    if (publisherInstance) {
        await publisherInstance.close();
        publisherInstance = null;
    }
}
