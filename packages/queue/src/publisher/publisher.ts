import type { ChannelManager } from "../channel/channel-manager";
import type { PublisherConfig } from "../config/types";

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
     * Publishes a message to the queue
     *
     * @param message - The message to publish (will be JSON stringified)
     * @param queueName - Optional queue name override
     * @throws Error if publishing fails
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
                throw new Error("Failed to publish message to queue");
            }

            this.logger?.debug("Message published to queue", {
                queue: actualQueueName,
            });
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
