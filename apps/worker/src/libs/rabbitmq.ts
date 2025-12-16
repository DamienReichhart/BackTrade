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

        connection.on("error", (err) => {
            rabbitmqLogger.error(err, "RabbitMQ connection error");
        });

        connection.on("close", () => {
            rabbitmqLogger.warn("RabbitMQ connection closed");
            connection = null;
            channel = null;
        });

        channel = await connection.createChannel();
        rabbitmqLogger.info("RabbitMQ channel created");

        // Assert queue exists (creates if it doesn't)
        await channel.assertQueue(QUEUE_NAME, {
            durable: true, // Queue survives broker restart
        });
        rabbitmqLogger.info({ queue: QUEUE_NAME }, "Queue asserted");
    } catch (err) {
        rabbitmqLogger.error(err, "Failed to connect to RabbitMQ");
        throw err;
    }
}

/**
 * Consumes messages from the queue
 */
async function consumeMessages(
    onMessage: (message: unknown) => Promise<void>
): Promise<void> {
    if (!channel) {
        await connect();
    }

    if (!channel) {
        throw new Error("Failed to create RabbitMQ channel");
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
                const content = JSON.parse(msg.content.toString());
                rabbitmqLogger.debug(
                    { messageId: content.id, type: content.type },
                    "Message received"
                );

                await onMessage(content);

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
