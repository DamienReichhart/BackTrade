import type amqp from "amqplib";

/**
 * AMQP Connection type - using the actual return type from amqp.connect()
 */
export type AmqpConnection = Awaited<ReturnType<typeof amqp.connect>>;

/**
 * AMQP Channel type - using the actual return type from connection.createChannel()
 */
export type AmqpChannel = Awaited<ReturnType<AmqpConnection["createChannel"]>>;

/**
 * Message handler function type
 */
export type MessageHandler<T = unknown> = (message: T) => Promise<void>;
