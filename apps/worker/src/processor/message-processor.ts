/**
 * Message Processor
 *
 * Handles processing of messages from the queue.
 * Orchestrates message routing, status updates, retry logic, and error handling.
 */

import { logger } from "../libs/pino";
import { QueueName, type QueueJobMessage } from "@backtrade/types";
import queueJobService from "../services/queue-job-service";
import dataProcessor from "./data-processor";
import mailProcessor from "./mail-processor";

/**
 * Message Processor
 *
 * Processes messages from the queue, handles status transitions,
 * and delegates to specific processors based on message type.
 */
class MessageProcessor {
    private readonly logger: ReturnType<typeof logger.child>;
    private readonly maxRetries: number;

    constructor() {
        this.logger = logger.child({
            service: "message-processor",
        });
        /**
         * Maximum number of retries before marking a job as permanently failed
         */
        this.maxRetries = 3;
    }

    /**
     * Process a message from the queue
     *
     * Fetches the QueueJob from the database using the queueJobId from the message,
     * updates its status, processes it, and handles retries and errors.
     *
     * @param message - Queue job message from RabbitMQ
     * @throws Error if processing fails and retry should occur
     */
    async processMessage(message: QueueJobMessage): Promise<void> {
        const { queueJobId, type } = message;

        this.logger.info({ queueJobId, type }, "Processing message");

        // Fetch QueueJob from database
        let queueJob;
        try {
            queueJob = await queueJobService.getQueueJobById(queueJobId);
        } catch (err) {
            // Service already logged the error
            // Re-throw to trigger RabbitMQ requeue for transient DB errors
            throw err;
        }

        // Handle missing QueueJob
        if (!queueJob) {
            this.logger.error(
                { queueJobId, type },
                "QueueJob not found in database, acknowledging message"
            );
            // Don't throw - acknowledge the message to prevent infinite requeue
            return;
        }

        // Update status to PROCESSING
        try {
            await queueJobService.startProcessing(queueJobId);
        } catch (err) {
            // Service already logged the error
            // Re-throw to trigger RabbitMQ requeue for transient DB errors
            throw err;
        }

        try {
            // Process message based on type using payload from QueueJob
            switch (type) {
                case QueueName.dataProcessing:
                    await dataProcessor.process(queueJob.payload);
                    break;
                case QueueName.mail:
                    await mailProcessor.process(queueJob.payload);
                    break;
                default:
                    this.logger.warn(
                        { queueJobId, type },
                        "Unknown message type"
                    );
                    throw new Error(`Unknown message type: ${type}`);
            }

            // Mark as completed on success
            await queueJobService.completeProcessing(queueJobId);

            this.logger.info(
                { queueJobId, type },
                "QueueJob processed successfully"
            );
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : String(err);

            this.logger.error(
                { queueJobId, type, err },
                "Failed to process QueueJob"
            );

            // Handle retry logic using service
            const { shouldRetry } =
                await queueJobService.handleProcessingFailure(
                    queueJobId,
                    queueJob.retry_count,
                    this.maxRetries,
                    errorMessage,
                    queueJob
                );

            if (shouldRetry) {
                // Throw error to trigger RabbitMQ requeue
                throw err;
            }
            // If shouldRetry is false, don't throw - acknowledge the message
            // The job is marked as FAILED in the database by the service
        }
    }
}

export default new MessageProcessor();
