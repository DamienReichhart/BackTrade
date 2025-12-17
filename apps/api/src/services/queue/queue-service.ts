import { publishMessage } from "../../libs/rabbitmq";
import { logger } from "../../libs/logger/pino";

/**
 * Queue message structure
 */
export interface QueueMessage {
    id: string;
    type: string;
    data: unknown;
    timestamp: string;
}

/**
 * Queue Service
 *
 * Handles message queuing operations for worker processing.
 */
class QueueService {
    private readonly logger: ReturnType<typeof logger.child>;

    constructor() {
        this.logger = logger.child({
            service: "queue-service",
        });
    }

    /**
     * Queue a message for processing by the data worker
     *
     * @param type - Message type identifier
     * @param data - Message data payload
     * @throws Error if message queuing fails
     */
    async queueMessage(type: string, data: unknown): Promise<void> {
        const message: QueueMessage = {
            id: crypto.randomUUID(),
            type,
            data,
            timestamp: new Date().toISOString(),
        };

        try {
            await publishMessage(message);
            this.logger.debug(
                { messageId: message.id, type },
                "Message queued successfully"
            );
        } catch (err) {
            this.logger.error(
                { messageId: message.id, type, err },
                "Failed to queue message"
            );
            throw err;
        }
    }
}

export default new QueueService();
