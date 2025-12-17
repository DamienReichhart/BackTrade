/**
 * RabbitMQ connection configuration
 */
export interface RabbitMQConnectionConfig {
    /** RabbitMQ host */
    host: string;
    /** RabbitMQ port */
    port: number;
    /** RabbitMQ username */
    username: string;
    /** RabbitMQ password */
    password: string;
}

/**
 * Queue configuration
 */
export interface QueueConfig {
    /** Queue name */
    name: string;
    /** Whether the queue should be durable (survives broker restart) */
    durable?: boolean;
    /** Whether the queue should be exclusive */
    exclusive?: boolean;
    /** Whether the queue should auto-delete when unused */
    autoDelete?: boolean;
    /** Additional queue arguments */
    arguments?: Record<string, unknown>;
}

/**
 * Publisher configuration
 */
export interface PublisherConfig {
    /** Whether messages should be persistent (survive broker restart) */
    persistent?: boolean;
    /** Message priority (0-255) */
    priority?: number;
    /** Message expiration time in milliseconds */
    expiration?: string;
    /** Additional message properties */
    properties?: Record<string, unknown>;
}

/**
 * Consumer configuration
 */
export interface ConsumerConfig {
    /** Prefetch count (number of unacknowledged messages per consumer) */
    prefetch?: number;
    /** Whether to acknowledge messages automatically */
    noAck?: boolean;
    /** Consumer tag */
    consumerTag?: string;
    /** Whether to reject and requeue messages on error */
    requeueOnError?: boolean;
}

/**
 * Reconnection configuration
 */
export interface ReconnectionConfig {
    /** Initial delay in milliseconds before first retry */
    initialDelayMs?: number;
    /** Maximum delay in milliseconds between retries */
    maxDelayMs?: number;
    /** Maximum number of retry attempts (undefined = infinite) */
    maxAttempts?: number;
    /** Jitter range in milliseconds to add to backoff */
    jitterMs?: number;
}

/**
 * Complete RabbitMQ client configuration
 */
export interface RabbitMQConfig {
    /** Connection configuration */
    connection: RabbitMQConnectionConfig;
    /** Queue configuration */
    queue: QueueConfig;
    /** Publisher configuration (optional) */
    publisher?: PublisherConfig;
    /** Consumer configuration (optional) */
    consumer?: ConsumerConfig;
    /** Reconnection configuration (optional) */
    reconnection?: ReconnectionConfig;
    /** Logger instance (optional, for dependency injection) */
    logger?: {
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
}
