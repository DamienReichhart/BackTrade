import { publishMessage } from "../../libs/rabbitmq";
import { logger } from "../../libs/logger/pino";

const queueServiceLogger = logger.child({
    service: "queue-service",
});

export interface QueueMessage {
    id: string;
    type: string;
    data: unknown;
    timestamp: string;
}

/**
 * Queues a message for processing by the data worker
 */
async function queueMessage(type: string, data: unknown): Promise<void> {
    const message: QueueMessage = {
        id: crypto.randomUUID(),
        type,
        data,
        timestamp: new Date().toISOString(),
    };

    try {
        await publishMessage(message);
        queueServiceLogger.debug(
            { messageId: message.id, type },
            "Message queued successfully"
        );
    } catch (err) {
        queueServiceLogger.error(
            { messageId: message.id, type, err },
            "Failed to queue message"
        );
        throw err;
    }
}

export default {
    queueMessage,
};
