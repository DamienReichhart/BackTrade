import type { ChannelManager } from "../channel/channel-manager";
import type { PublisherConfig } from "../config/types";
import type { AmqpChannel } from "../types";

/**
 * Publisher
 *
 * Handles publishing messages to RabbitMQ queues with:
 * - Automatic channel management
 * - Configurable message properties
 * - Error handling and retry logic
 */
export class Publisher {
    private readonly channelManager: ChannelManager;
    private readonly config: PublisherConfig;
    private readonly logger?: {
        info: (message: string, meta?: Record<string, unknown>) => void;
        error: (
            error: unknown,
            message: string,
            meta?: Record<string, unknown>
        ) => void;
        warn: (message: string, meta?: Record<string, unknown>) => void;
        debug: (message: string, meta?: Record<string, unknown>) => void;
        trace: (message: string, meta?: Record<string, unknown>) => void;
    };

    constructor(
        channelManager: ChannelManager,
        config?: PublisherConfig,
        logger?: Publisher["logger"]
    ) {
        this.channelManager = channelManager;
        this.config = {
            persistent: true, // Default to persistent messages
            ...config,
        };
        this.logger = logger;
    }

    /**
     * Waits for the channel to emit a 'drain' event, indicating it's ready for more writes
     *
     * @param channel - The AMQP channel to wait on
     * @returns Promise that resolves when the channel is ready
     */
    private waitForDrain(channel: AmqpChannel): Promise<void> {
        return new Promise<void>((resolve) => {
            // Channel buffer is full - wait for drain event
            // The message has already been queued internally and will be sent when buffer drains
            const onDrain = () => {
                channel.removeListener("drain", onDrain);
                resolve();
            };
            channel.once("drain", onDrain);
        });
    }

    /**
     * Publishes a message to the queue
     *
     * @param message - The message to publish (will be JSON stringified)
     * @param queueName - Optional queue name override
     * @throws Error if publishing fails (not due to backpressure)
     */
    async publish<T = unknown>(message: T, queueName?: string): Promise<void> {
        try {
            const channel = await this.channelManager.getChannel();

            const messageBuffer = Buffer.from(JSON.stringify(message));
            const actualQueueName =
                queueName ?? this.channelManager.getQueueName();
            const published = channel.sendToQueue(
                actualQueueName,
                messageBuffer,
                {
                    persistent: this.config.persistent ?? true,
                    priority: this.config.priority,
                    expiration: this.config.expiration,
                    ...this.config.properties,
                }
            );

            if (!published) {
                // Channel buffer is full - wait for drain event
                // This is not an error; the message will be sent when the buffer drains
                this.logger?.warn("Channel buffer full, waiting for drain", {
                    queue: actualQueueName,
                });
                await this.waitForDrain(channel);
                this.logger?.debug("Channel drained, message queued", {
                    queue: actualQueueName,
                });
            } else {
                this.logger?.debug("Message published to queue", {
                    queue: actualQueueName,
                });
            }
        } catch (err) {
            this.logger?.error(err, "Failed to publish message");
            throw err;
        }
    }

    /**
     * Ensures connection and channel are ready
     */
    async connect(): Promise<void> {
        await this.channelManager.ensureChannel();
    }

    /**
     * Checks if the publisher is healthy (connection and channel available)
     */
    isHealthy(): boolean {
        return (
            this.channelManager.getConnectionManager().isConnected() &&
            this.channelManager.isChannelAvailable()
        );
    }

    /**
     * Closes the publisher (closes underlying channel)
     */
    async close(): Promise<void> {
        await this.channelManager.close();
    }
}
