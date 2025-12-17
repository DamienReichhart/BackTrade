import type { MessageHandler } from "../types";
import type { ChannelManager } from "../channel/channel-manager";
import type { ConsumerConfig } from "../config/types";

/**
 * Consumer
 *
 * Handles consuming messages from RabbitMQ queues with:
 * - Automatic channel management
 * - Configurable prefetch and acknowledgment
 * - Error handling and message requeuing
 * - Automatic consumer restart on reconnection
 */
export class Consumer<T = unknown> {
    private readonly channelManager: ChannelManager;
    private readonly config: ConsumerConfig;
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
    private messageHandler: MessageHandler<T> | null = null;
    private isConsuming = false;
    private consumerTag: string | null = null;
    private queueNameOverride: string | undefined = undefined;

    constructor(
        channelManager: ChannelManager,
        config?: ConsumerConfig,
        logger?: Consumer["logger"]
    ) {
        this.channelManager = channelManager;
        this.config = {
            prefetch: 1, // Default to processing one message at a time
            noAck: false, // Default to manual acknowledgment
            requeueOnError: true, // Default to requeue on error
            ...config,
        };
        this.logger = logger;

        // Set up reconnection handler to restart consumer
        this.channelManager
            .getConnectionManager()
            .addReconnectHandler(async () => {
                if (this.messageHandler) {
                    await this.startConsuming(this.queueNameOverride);
                }
            });
    }

    /**
     * Ensures connection and channel are ready
     */
    async connect(): Promise<void> {
        await this.channelManager.ensureChannel();
    }

    /**
     * Starts consuming messages from the queue
     *
     * @param handler - Message handler function
     * @param queueName - Optional queue name override
     */
    async consume(
        handler: MessageHandler<T>,
        queueName?: string
    ): Promise<void> {
        if (this.isConsuming) {
            this.logger?.warn("Consumer is already consuming messages");
            return;
        }

        this.messageHandler = handler;
        this.queueNameOverride = queueName;
        await this.startConsuming(queueName);
    }

    /**
     * Internal method to start consuming
     */
    private async startConsuming(queueName?: string): Promise<void> {
        if (!this.messageHandler) {
            this.logger?.warn(
                "No message handler registered, skipping consumer start"
            );
            return;
        }

        // Reset consuming state in case we're restarting after reconnection
        this.isConsuming = false;
        this.consumerTag = null;

        try {
            const channel = await this.channelManager.getChannel();

            // Set prefetch to limit unacknowledged messages
            if (this.config.prefetch !== undefined) {
                await channel.prefetch(this.config.prefetch);
            }

            const actualQueueName =
                queueName ?? this.channelManager.getQueueName();

            // Start consuming
            const result = await channel.consume(
                actualQueueName,
                async (msg) => {
                    if (!msg) {
                        return;
                    }

                    const handler = this.messageHandler;
                    if (!handler) {
                        this.logger?.warn(
                            "No message handler registered when message arrived, skipping message"
                        );
                        channel.nack(msg, false, false); // Reject without requeue
                        return;
                    }

                    try {
                        const content = JSON.parse(msg.content.toString()) as T;

                        this.logger?.debug("Message received", {
                            messageId: (content as { id?: string }).id,
                            type: (content as { type?: string }).type,
                        });

                        await handler(content);

                        // Acknowledge message after successful processing
                        if (!this.config.noAck) {
                            channel.ack(msg);
                            this.logger?.debug(
                                "Message processed and acknowledged",
                                {
                                    messageId: (content as { id?: string }).id,
                                }
                            );
                        }
                    } catch (err) {
                        this.logger?.error(err, "Error processing message", {
                            message: msg.content.toString(),
                        });

                        // Reject message
                        if (!this.config.noAck) {
                            const requeue = this.config.requeueOnError ?? true;
                            channel.nack(msg, false, requeue);
                            this.logger?.warn("Message rejected", {
                                requeue,
                            });
                        }
                    }
                },
                {
                    noAck: this.config.noAck ?? false,
                    consumerTag: this.config.consumerTag,
                }
            );

            this.consumerTag = result.consumerTag;
            this.isConsuming = true;

            this.logger?.info("Started consuming messages", {
                queue: actualQueueName,
                prefetch: this.config.prefetch,
                consumerTag: this.consumerTag,
            });
        } catch (err) {
            this.logger?.error(err, "Failed to start consumer");
            throw err;
        }
    }

    /**
     * Stops consuming messages
     */
    async stop(): Promise<void> {
        if (!this.isConsuming || !this.consumerTag) {
            return;
        }

        try {
            const channel = await this.channelManager.getChannel();
            await channel.cancel(this.consumerTag);
            this.logger?.info("Stopped consuming messages", {
                consumerTag: this.consumerTag,
            });
        } catch (err) {
            this.logger?.error(err, "Error stopping consumer");
            throw err;
        } finally {
            this.isConsuming = false;
            this.consumerTag = null;
        }
    }

    /**
     * Closes the consumer (stops consuming and closes underlying channel)
     */
    async close(): Promise<void> {
        await this.stop();
        await this.channelManager.close();
    }
}
