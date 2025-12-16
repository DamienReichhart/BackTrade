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

/**
 * Connects to RabbitMQ and creates a channel
 */
async function connect(): Promise<void> {
    if (connection && channel) {
        rabbitmqLogger.trace("RabbitMQ already connected");
        return;
    }

    try {
        const connectionUrl = `amqp://${ENV.RABBITMQ_USER}:${ENV.RABBITMQ_PASSWORD}@${ENV.RABBITMQ_HOST}:${ENV.RABBITMQ_PORT}`;
        connection = await amqp.connect(connectionUrl);
        rabbitmqLogger.info("Connected to RabbitMQ");

        connection.on("error", (err: Error) => {
            rabbitmqLogger.error(err, "RabbitMQ connection error");
        });

        connection.on("close", () => {
            rabbitmqLogger.warn("RabbitMQ connection closed");
            connection = null;
            channel = null;
        });

        const newChannel = await connection.createChannel();
        channel = newChannel;
        rabbitmqLogger.info("RabbitMQ channel created");

        // Assert queue exists (creates if it doesn't)
        await newChannel.assertQueue(QUEUE_NAME, {
            durable: true, // Queue survives broker restart
        });
        rabbitmqLogger.info({ queue: QUEUE_NAME }, "Queue asserted");
    } catch (err) {
        rabbitmqLogger.error(err, "Failed to connect to RabbitMQ");
        throw err;
    }
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
