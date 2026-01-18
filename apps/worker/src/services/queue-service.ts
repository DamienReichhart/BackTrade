/**
 * Queue Service
 *
 * Handles message queuing operations for worker processors.
 * Creates QueueJob records in the database and publishes messages to RabbitMQ.
 */

import { publishMessage } from "../libs/rabbitmq";
import { logger } from "../libs/pino";
import type { QueueJobMessage, QueueName } from "@backtrade/types";
import { queueJobsRepo } from "@backtrade/data";

/**
 * Queue Service
 *
 * Handles message queuing operations from within worker processors.
 * Used when a processor needs to create follow-up jobs (e.g., file split creates part processing jobs).
 */
class QueueService {
    private readonly logger: ReturnType<typeof logger.child>;

    constructor() {
        this.logger = logger.child({
            service: "worker-queue-service",
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
    async queueMessage(type: QueueName, data: unknown): Promise<number> {
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
