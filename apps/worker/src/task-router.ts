/**
 * Task Router
 *
 * Handles routing and processing of tasks from the queue.
 * Orchestrates task routing, status updates, retry logic, and error handling.
 */

import { logger } from "./libs/pino";
import { QueueName, type QueueJobMessage } from "@backtrade/types";
import queueJobService from "./services/queue-job-service";
import dataProcessor from "./processor/data-processor";
import datasetFileSplitProcessor from "./processor/dataset-file-split-processor";
import datasetPartProcessor from "./processor/dataset-part-processor";
import mailProcessor from "./processor/mail-processor";

/**
 * Task Router
 *
 * Routes tasks from the queue to appropriate processors, handles status transitions,
 * and manages retry logic and error handling.
 */
class TaskRouter {
    private readonly logger: ReturnType<typeof logger.child>;
    private readonly maxRetries: number;

    constructor() {
        this.logger = logger.child({
            service: "task-router",
        });
        /**
         * Maximum number of retries before marking a job as permanently failed
         */
        this.maxRetries = 3;
    }

    /**
     * Process a task message from the queue
     *
     * Fetches the QueueJob from the database using the queueJobId from the message,
     * updates its status, routes it to the appropriate processor, and handles retries and errors.
     *
     * @param message - Queue job message from RabbitMQ
     * @throws Error if processing fails and retry should occur
     */
    async processTask(message: QueueJobMessage): Promise<void> {
        const { queueJobId, type } = message;

        this.logger.info({ queueJobId, type }, "Processing task");

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
            // Route task to appropriate processor based on type using payload from QueueJob
            await this.routeTask(type, queueJob.payload);

            // Mark as completed on success
            await queueJobService.completeProcessing(queueJobId);

            this.logger.info(
                { queueJobId, type },
                "Task processed successfully"
            );
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : String(err);

            this.logger.error(
                { queueJobId, type, err },
                "Failed to process task"
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

    /**
     * Route task to appropriate processor based on task type
     *
     * @param type - Queue task type
     * @param payload - Task payload data
     * @throws Error if task type is unknown or processing fails
     */
    private async routeTask(type: QueueName, payload: unknown): Promise<void> {
        switch (type) {
            case QueueName.dataProcessing:
                await dataProcessor.process(payload);
                break;
            case QueueName.datasetFileSplit:
                await datasetFileSplitProcessor.process(payload);
                break;
            case QueueName.datasetPartProcess:
                await datasetPartProcessor.process(payload);
                break;
            case QueueName.mail:
                await mailProcessor.process(payload);
                break;
            default:
                this.logger.warn({ type }, "Unknown task type");
                throw new Error(`Unknown task type: ${type}`);
        }
    }
}

export default new TaskRouter();
