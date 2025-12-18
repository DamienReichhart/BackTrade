import { publishMessage } from "../../libs/rabbitmq";
import { logger } from "../../libs/pino";
import type { QueueJobMessage } from "@backtrade/types";
import { queueJobsRepo } from "@backtrade/datas";

/**
 * Queue Service
 *
 * Handles message queuing operations for worker processing.
 * Creates QueueJob records in the database and publishes minimal messages to RabbitMQ.
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
     * Creates a QueueJob in the database with status PENDING, then publishes
     * a minimal message (type + queueJobId) to RabbitMQ. If RabbitMQ publish
     * fails, the QueueJob is marked as QUEUE_FAILED.
     *
     * @param type - Message type identifier
     * @param data - Message data payload (stored in QueueJob.payload)
     * @returns The created QueueJob ID
     * @throws Error if QueueJob creation fails
     */
    async queueMessage(type: string, data: unknown): Promise<number> {
        let queueJobId: number;

        try {
            // Create QueueJob in database with status PENDING
            const queueJob = await queueJobsRepo.createQueueJob({
                type,
                status: "PENDING",
                payload: data,
            });

            queueJobId = queueJob.id;

            this.logger.debug(
                { queueJobId, type },
                "QueueJob created in database"
            );
        } catch (err) {
            this.logger.error(
                { type, err },
                "Failed to create QueueJob in database"
            );
            throw err;
        }

        try {
            const message: QueueJobMessage = {
                type,
                queueJobId,
                timestamp: new Date().toISOString(),
            };

            await publishMessage(message);

            this.logger.debug(
                { queueJobId, type },
                "Message published to RabbitMQ successfully"
            );
        } catch (err) {
            // If RabbitMQ publish fails, mark QueueJob as QUEUE_FAILED
            try {
                await queueJobsRepo.markAsQueueFailed(
                    queueJobId,
                    err instanceof Error ? err.message : String(err)
                );

                this.logger.error(
                    { queueJobId, type, err },
                    "Failed to publish message to RabbitMQ, marked QueueJob as QUEUE_FAILED"
                );
            } catch (updateErr) {
                // If marking as QUEUE_FAILED also fails, log but don't throw
                // The QueueJob exists but we couldn't update its status
                this.logger.error(
                    { queueJobId, type, err, updateErr },
                    "Failed to publish to RabbitMQ and failed to update QueueJob status"
                );
            }

            throw err;
        }

        return queueJobId;
    }
}

export default new QueueService();
