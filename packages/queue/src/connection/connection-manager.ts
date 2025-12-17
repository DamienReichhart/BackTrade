import amqp from "amqplib";
import type { AmqpConnection } from "../types";
import type {
    RabbitMQConnectionConfig,
    ReconnectionConfig,
} from "../config/types";

/**
 * Default reconnection configuration
 */
const DEFAULT_RECONNECTION_CONFIG: Required<
    Omit<ReconnectionConfig, "maxAttempts">
> & {
    maxAttempts?: number;
} = {
    initialDelayMs: 1_000,
    maxDelayMs: 30_000,
    maxAttempts: undefined, // Infinite retries
    jitterMs: 500,
};

/**
 * Connection Manager
 *
 * Handles RabbitMQ connection lifecycle, including:
 * - Connection establishment
 * - Automatic reconnection with exponential backoff
 * - Connection health checks
 * - Graceful shutdown
 */
export class ConnectionManager {
    private connection: AmqpConnection | null = null;
    private isConnecting = false;
    private isClosing = false;
    private connectPromise: Promise<void> | null = null;
    private readonly config: RabbitMQConnectionConfig;
    private readonly reconnectionConfig: Required<
        Omit<ReconnectionConfig, "maxAttempts">
    > & {
        maxAttempts?: number;
    };
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
    private reconnectHandlers: Array<() => void | Promise<void>> = [];

    constructor(
        config: RabbitMQConnectionConfig,
        reconnectionConfig?: ReconnectionConfig,
        logger?: ConnectionManager["logger"]
    ) {
        this.config = config;
        this.reconnectionConfig = {
            ...DEFAULT_RECONNECTION_CONFIG,
            ...reconnectionConfig,
        };
        this.logger = logger;
    }

    /**
     * Adds a handler to be called after successful reconnection
     * Multiple handlers can be registered and will all be called
     */
    addReconnectHandler(handler: () => void | Promise<void>): void {
        this.reconnectHandlers.push(handler);
    }

    /**
     * Removes a reconnect handler
     */
    removeReconnectHandler(handler: () => void | Promise<void>): void {
        const index = this.reconnectHandlers.indexOf(handler);
        if (index > -1) {
            this.reconnectHandlers.splice(index, 1);
        }
    }

    /**
     * Gets the connection URL
     */
    private getConnectionUrl(): string {
        return `amqp://${this.config.username}:${this.config.password}@${this.config.host}:${this.config.port}`;
    }

    /**
     * Establishes a new connection (single attempt, no retries)
     */
    private async connectOnce(): Promise<void> {
        const connectionUrl = this.getConnectionUrl();
        const newConnection = await amqp.connect(connectionUrl);

        this.logger?.info("Connected to RabbitMQ", {
            host: this.config.host,
            port: this.config.port,
        });

        newConnection.on("error", (err: Error) => {
            this.logger?.error(err, "RabbitMQ connection error");
        });

        newConnection.on("close", () => {
            if (this.isClosing) {
                this.logger?.info("RabbitMQ connection closed intentionally");
            } else {
                this.logger?.warn(
                    "RabbitMQ connection closed, will attempt to reconnect"
                );
                this.connection = null;
                // Trigger reconnection in background
                void this.connect().catch((err) => {
                    this.logger?.error(
                        err,
                        "Error while attempting to reconnect to RabbitMQ"
                    );
                });
            }
        });

        this.connection = newConnection;
    }

    /**
     * Connects to RabbitMQ with automatic retry and exponential backoff
     *
     * This function will keep retrying until a connection is successfully established,
     * unless maxAttempts is set and reached.
     */
    async connect(): Promise<void> {
        if (this.connection && !this.isConnectionClosed()) {
            this.logger?.trace("RabbitMQ already connected");
            return;
        }

        if (this.isConnecting && this.connectPromise) {
            // If a connection attempt is already in progress, wait for it
            return this.connectPromise;
        }

        if (this.isClosing) {
            throw new Error("Cannot connect while closing");
        }

        this.isConnecting = true;
        this.connectPromise = (async () => {
            let attempt = 0;

            while (!this.connection || this.isConnectionClosed()) {
                // Check max attempts if configured
                if (
                    this.reconnectionConfig.maxAttempts !== undefined &&
                    attempt >= this.reconnectionConfig.maxAttempts
                ) {
                    throw new Error(
                        `Failed to connect after ${this.reconnectionConfig.maxAttempts} attempts`
                    );
                }

                attempt += 1;

                try {
                    this.logger?.info("Attempting to connect to RabbitMQ", {
                        attempt,
                    });
                    await this.connectOnce();
                    this.logger?.info("Successfully connected to RabbitMQ", {
                        attempt,
                    });

                    // Call all reconnect handlers
                    for (const handler of this.reconnectHandlers) {
                        try {
                            await handler();
                        } catch (err) {
                            this.logger?.error(
                                err,
                                "Error in reconnect handler"
                            );
                        }
                    }

                    break;
                } catch (err) {
                    this.logger?.error(err, "Failed to connect to RabbitMQ", {
                        attempt,
                    });

                    const backoff =
                        Math.min(
                            this.reconnectionConfig.initialDelayMs *
                                Math.pow(2, attempt - 1),
                            this.reconnectionConfig.maxDelayMs
                        ) +
                        Math.floor(
                            Math.random() * this.reconnectionConfig.jitterMs
                        );

                    this.logger?.warn(
                        "Will retry RabbitMQ connection after delay",
                        {
                            backoff,
                            attempt,
                        }
                    );

                    await new Promise((resolve) =>
                        setTimeout(resolve, backoff)
                    );
                }
            }
        })()
            .catch((err) => {
                this.logger?.error(
                    err,
                    "Unexpected error in RabbitMQ connection loop"
                );
                throw err;
            })
            .finally(() => {
                this.isConnecting = false;
                this.connectPromise = null;
            });

        return this.connectPromise;
    }

    /**
     * Checks if the connection is closed
     */
    private isConnectionClosed(): boolean {
        if (!this.connection) {
            return true;
        }

        // Check if connection is closed (amqplib connections have a 'closed' property)
        const conn = this.connection as unknown as { closed?: boolean };
        return conn.closed === true;
    }

    /**
     * Gets the current connection
     *
     * @throws Error if not connected
     */
    getConnection(): AmqpConnection {
        if (!this.connection || this.isConnectionClosed()) {
            throw new Error("RabbitMQ connection not available");
        }
        return this.connection;
    }

    /**
     * Checks if the connection is healthy
     */
    isConnected(): boolean {
        return this.connection !== null && !this.isConnectionClosed();
    }

    /**
     * Closes the connection gracefully
     */
    async close(): Promise<void> {
        if (this.isClosing) {
            return;
        }

        this.isClosing = true;

        try {
            if (this.connection && !this.isConnectionClosed()) {
                await this.connection.close();
                this.logger?.info("RabbitMQ connection closed");
            }
        } catch (err) {
            this.logger?.error(err, "Error closing RabbitMQ connection");
            throw err;
        } finally {
            this.connection = null;
            this.isClosing = false;
        }
    }
}
