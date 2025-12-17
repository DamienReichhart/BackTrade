import amqp from "amqplib";
import { ENV } from "../config/env";
import { logger } from "./logger/pino";

const rabbitmqLogger = logger.child({
    service: "rabbitmq",
});
// Using ReturnType to get the correct types from amqplib
type AmqpConnection = Awaited<ReturnType<typeof amqp.connect>>;
type AmqpChannel = Awaited<ReturnType<AmqpConnection["createChannel"]>>;

let connection: AmqpConnection | null = null;
let channel: AmqpChannel | null = null;

const QUEUE_NAME = ENV.RABBITMQ_QUEUE_NAME;
const RECONNECT_INITIAL_DELAY_MS = 1_000;
const RECONNECT_MAX_DELAY_MS = 30_000;

let connectPromise: Promise<void> | null = null;
let currentOnMessage: ((message: unknown) => Promise<void>) | null = null;

function getConnectionUrl(): string {
    return `amqp://${ENV.RABBITMQ_USER}:${ENV.RABBITMQ_PASSWORD}@${ENV.RABBITMQ_HOST}:${ENV.RABBITMQ_PORT}`;
}

/**
 * Establishes a new RabbitMQ connection + channel once (no retries)
 */
async function connectOnce(): Promise<void> {
    const connectionUrl = getConnectionUrl();
    const newConnection = await amqp.connect(connectionUrl);
    rabbitmqLogger.info("Connected to RabbitMQ");

    newConnection.on("error", (err) => {
        rabbitmqLogger.error(err, "RabbitMQ connection error");
    });

    newConnection.on("close", () => {
        rabbitmqLogger.warn(
            "RabbitMQ connection closed, will attempt to reconnect"
        );
        connection = null;
        channel = null;

        // Background reconnection loop that also restarts the consumer
        void reconnectAndResumeConsumer().catch((err) => {
            rabbitmqLogger.error(
                err,
                "Error while attempting to reconnect to RabbitMQ"
            );
        });
    });

    const newChannel: AmqpChannel = await newConnection.createChannel();

    // Assert queue exists (creates if it doesn't)
    await newChannel.assertQueue(QUEUE_NAME, {
        durable: true, // Queue survives broker restart
    });

    connection = newConnection;
    channel = newChannel;

    rabbitmqLogger.info("RabbitMQ channel created");
    rabbitmqLogger.info({ queue: QUEUE_NAME }, "Queue asserted");
}

/**
 * Connects to RabbitMQ and creates a channel.
 *
 * This function will keep retrying with exponential backoff until
 * a connection + channel are successfully established.
 */
async function connect(): Promise<void> {
    if (connection && channel) {
        rabbitmqLogger.trace("RabbitMQ already connected");
        return;
    }

    if (connectPromise) {
        // If a connection attempt is already in progress, wait for it
        return connectPromise;
    }

    connectPromise = (async () => {
        let attempt = 0;

        while (!connection || !channel) {
            attempt += 1;

            try {
                rabbitmqLogger.info(
                    { attempt },
                    "Attempting to connect to RabbitMQ"
                );
                await connectOnce();
                rabbitmqLogger.info(
                    { attempt },
                    "Successfully connected to RabbitMQ"
                );
                break;
            } catch (err) {
                rabbitmqLogger.error(
                    { err, attempt },
                    "Failed to connect to RabbitMQ"
                );

                const backoff =
                    Math.min(
                        RECONNECT_INITIAL_DELAY_MS * Math.pow(2, attempt - 1),
                        RECONNECT_MAX_DELAY_MS
                    ) +
                    // Add a little jitter to avoid thundering herd if we scale out
                    Math.floor(Math.random() * 500);

                rabbitmqLogger.warn(
                    { backoff },
                    "Will retry RabbitMQ connection after delay (ms)"
                );

                await new Promise((resolve) => setTimeout(resolve, backoff));
            }
        }
    })()
        .catch((err) => {
            // This should be very rare since we loop indefinitely,
            // but we still log any unexpected errors.
            rabbitmqLogger.error(
                err,
                "Unexpected error in RabbitMQ connection loop"
            );
            throw err;
        })
        .finally(() => {
            connectPromise = null;
        });

    return connectPromise;
}

/**
 * Starts consuming messages from the queue on the current channel
 */
async function startConsumer(): Promise<void> {
    if (!channel) {
        throw new Error("Cannot start consumer without a RabbitMQ channel");
    }
    if (!currentOnMessage) {
        rabbitmqLogger.warn(
            "No consumer callback registered, skipping consumer start"
        );
        return;
    }

    // Set prefetch to 1 to process one message at a time
    await channel.prefetch(1);

    await channel.consume(
        QUEUE_NAME,
        async (msg) => {
            if (!msg) {
                return;
            }

            try {
                const handler = currentOnMessage;
                if (!handler) {
                    rabbitmqLogger.warn(
                        "No consumer callback registered when message arrived, skipping message"
                    );
                    return;
                }

                const content = JSON.parse(msg.content.toString());
                rabbitmqLogger.debug(
                    { messageId: content.id, type: content.type },
                    "Message received"
                );

                await handler(content);

                // Acknowledge message after successful processing
                channel?.ack(msg);
                rabbitmqLogger.debug(
                    { messageId: content.id },
                    "Message processed and acknowledged"
                );
            } catch (err) {
                rabbitmqLogger.error(
                    { err, message: msg.content.toString() },
                    "Error processing message"
                );

                // Reject message and requeue it
                channel?.nack(msg, false, true);
                rabbitmqLogger.warn("Message rejected and requeued");
            }
        },
        {
            noAck: false, // Manual acknowledgment
        }
    );

    rabbitmqLogger.info({ queue: QUEUE_NAME }, "Started consuming messages");
}

/**
 * Reconnects (with backoff) and restarts the consumer if a handler
 * has been registered via `consumeMessages`.
 */
async function reconnectAndResumeConsumer(): Promise<void> {
    await connect();

    if (currentOnMessage) {
        try {
            await startConsumer();
        } catch (err) {
            rabbitmqLogger.error(
                err,
                "Failed to restart consumer after reconnect"
            );
            throw err;
        }
    }
}

/**
 * Consumes messages from the queue
 */
async function consumeMessages(
    onMessage: (message: unknown) => Promise<void>
): Promise<void> {
    currentOnMessage = onMessage;

    await connect();
    await startConsumer();
}

/**
 * Closes the RabbitMQ connection
 */
async function close(): Promise<void> {
    if (channel) {
        await channel.close();
        channel = null;
        rabbitmqLogger.info("RabbitMQ channel closed");
    }

    if (connection) {
        await connection.close();
        connection = null;
        rabbitmqLogger.info("RabbitMQ connection closed");
    }
}

export { connect, consumeMessages, close, QUEUE_NAME };
