import type { AmqpChannel } from "../types";
import type { QueueConfig } from "../config/types";
import type { ConnectionManager } from "../connection/connection-manager";

/**
 * Channel Manager
 *
 * Handles RabbitMQ channel lifecycle, including:
 * - Channel creation from connection
 * - Queue assertion
 * - Channel health checks
 * - Automatic channel recreation on connection loss
 */
export class ChannelManager {
    private channel: AmqpChannel | null = null;
    private readonly connectionManager: ConnectionManager;
    private readonly queueConfig: QueueConfig;
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
        connectionManager: ConnectionManager,
        queueConfig: QueueConfig,
        logger?: ChannelManager["logger"]
    ) {
        this.connectionManager = connectionManager;
        this.queueConfig = queueConfig;
        this.logger = logger;

        // Set up reconnection handler to recreate channel
        this.connectionManager.addReconnectHandler(async () => {
            await this.ensureChannel();
        });
    }

    /**
     * Ensures a channel exists, creating one if necessary
     */
    async ensureChannel(): Promise<void> {
        if (this.channel && !this.isChannelClosed()) {
            this.logger?.trace("Channel already exists");
            return;
        }

        // Ensure connection exists
        await this.connectionManager.connect();
        const connection = this.connectionManager.getConnection();

        // Create new channel
        const newChannel = await connection.createChannel();
        this.logger?.info("RabbitMQ channel created");

        // Assert queue exists (creates if it doesn't)
        await newChannel.assertQueue(this.queueConfig.name, {
            durable: this.queueConfig.durable ?? true,
            exclusive: this.queueConfig.exclusive ?? false,
            autoDelete: this.queueConfig.autoDelete ?? false,
            arguments: this.queueConfig.arguments,
        });

        this.logger?.info("Queue asserted", {
            queue: this.queueConfig.name,
            durable: this.queueConfig.durable ?? true,
        });

        this.channel = newChannel;

        // Set up error handler
        newChannel.on("error", (err: Error) => {
            this.logger?.error(err, "RabbitMQ channel error");
        });

        newChannel.on("close", () => {
            this.logger?.warn("RabbitMQ channel closed");
            this.channel = null;
        });
    }

    /**
     * Checks if the channel is closed
     */
    private isChannelClosed(): boolean {
        if (!this.channel) {
            return true;
        }

        // Check if channel is closed (amqplib channels have a 'closed' property)
        const ch = this.channel as unknown as { closed?: boolean };
        return ch.closed === true;
    }

    /**
     * Gets the current channel, ensuring it exists first
     *
     * @throws Error if channel cannot be created
     */
    async getChannel(): Promise<AmqpChannel> {
        await this.ensureChannel();

        if (!this.channel || this.isChannelClosed()) {
            throw new Error("Failed to create RabbitMQ channel");
        }

        return this.channel;
    }

    /**
     * Checks if the channel is available
     */
    isChannelAvailable(): boolean {
        return this.channel !== null && !this.isChannelClosed();
    }

    /**
     * Gets the queue name
     */
    getQueueName(): string {
        return this.queueConfig.name;
    }

    /**
     * Gets the connection manager (for internal use by consumers/publishers)
     */
    getConnectionManager(): ConnectionManager {
        return this.connectionManager;
    }

    /**
     * Closes the channel gracefully
     */
    async close(): Promise<void> {
        if (this.channel && !this.isChannelClosed()) {
            try {
                await this.channel.close();
                this.logger?.info("RabbitMQ channel closed");
            } catch (err) {
                this.logger?.error(err, "Error closing RabbitMQ channel");
                throw err;
            } finally {
                this.channel = null;
            }
        }
    }
}
