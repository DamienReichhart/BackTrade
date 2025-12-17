import { ConnectionManager } from "./connection/connection-manager";
import { ChannelManager } from "./channel/channel-manager";
import { Publisher } from "./publisher/publisher";
import { Consumer } from "./consumer/consumer";
import type { RabbitMQConfig } from "./config/types";

/**
 * Creates a RabbitMQ publisher instance
 *
 * @param config - Complete RabbitMQ configuration
 * @returns Publisher instance
 */
export function createPublisher(config: RabbitMQConfig): Publisher {
    const connectionManager = new ConnectionManager(
        config.connection,
        config.reconnection,
        config.logger
    );

    const channelManager = new ChannelManager(
        connectionManager,
        config.queue,
        config.logger
    );

    return new Publisher(channelManager, config.publisher, config.logger);
}

/**
 * Creates a RabbitMQ consumer instance
 *
 * @param config - Complete RabbitMQ configuration
 * @returns Consumer instance
 */
export function createConsumer<T = unknown>(
    config: RabbitMQConfig
): Consumer<T> {
    const connectionManager = new ConnectionManager(
        config.connection,
        config.reconnection,
        config.logger
    );

    const channelManager = new ChannelManager(
        connectionManager,
        config.queue,
        config.logger
    );

    return new Consumer<T>(channelManager, config.consumer, config.logger);
}

/**
 * Creates both a publisher and consumer from the same configuration
 * (shares connection and channel managers for efficiency)
 *
 * @param config - Complete RabbitMQ configuration
 * @returns Object containing both publisher and consumer
 */
export function createQueueClient<T = unknown>(
    config: RabbitMQConfig
): {
    publisher: Publisher;
    consumer: Consumer<T>;
} {
    const connectionManager = new ConnectionManager(
        config.connection,
        config.reconnection,
        config.logger
    );

    const channelManager = new ChannelManager(
        connectionManager,
        config.queue,
        config.logger
    );

    const publisher = new Publisher(
        channelManager,
        config.publisher,
        config.logger
    );

    const consumer = new Consumer<T>(
        channelManager,
        config.consumer,
        config.logger
    );

    return { publisher, consumer };
}

// Export all types and classes for advanced usage
export { ConnectionManager } from "./connection/connection-manager";
export { ChannelManager } from "./channel/channel-manager";
export { Publisher } from "./publisher/publisher";
export { Consumer } from "./consumer/consumer";
export * from "./config/types";
export * from "./types";
