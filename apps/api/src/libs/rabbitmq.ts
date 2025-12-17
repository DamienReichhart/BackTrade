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

    newConnection.on("error", (err: Error) => {
        rabbitmqLogger.error(err, "RabbitMQ connection error");
    });

    newConnection.on("close", () => {
        rabbitmqLogger.warn(
            "RabbitMQ connection closed, will attempt to reconnect"
        );
        connection = null;
        channel = null;

        // Background reconnection loop
        void connect().catch((err) => {
            rabbitmqLogger.error(
                err,
                "Error while attempting to reconnect to RabbitMQ"
            );
        });
    });

    const newChannel = await newConnection.createChannel();

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
 * Publishes a message to the queue
 */
async function publishMessage(message: unknown): Promise<void> {
    if (!channel) {
        await connect();
    }

    if (!channel) {
        throw new Error("Failed to create RabbitMQ channel");
    }

    try {
        const messageBuffer = Buffer.from(JSON.stringify(message));
        const published = channel.sendToQueue(QUEUE_NAME, messageBuffer, {
            persistent: true, // Message survives broker restart
        });

        if (!published) {
            throw new Error("Failed to publish message to queue");
        }

        rabbitmqLogger.debug(
            { queue: QUEUE_NAME, message },
            "Message published to queue"
        );
    } catch (err) {
        rabbitmqLogger.error(err, "Failed to publish message");
        throw err;
    }
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

// Initialize connection on module load
connect().catch((err) => {
    rabbitmqLogger.error(err, "Failed to initialize RabbitMQ connection");
});

export { connect, publishMessage, close, QUEUE_NAME };
