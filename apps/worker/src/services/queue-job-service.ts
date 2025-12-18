/**
 * Queue Job Service
 *
 * Handles QueueJob lifecycle management for the worker.
 * Provides business logic for job status transitions, retry handling, and error management.
 */

import { logger } from "../libs/pino";
import { queueJobsRepo } from "@backtrade/datas";
import type { QueueJob } from "@backtrade/types";

/**
 * Queue Job Service
 *
 * Manages QueueJob operations including status transitions,
 * retry logic, and error handling.
 */
class QueueJobService {
    private readonly logger: ReturnType<typeof logger.child>;

    constructor() {
        this.logger = logger.child({
            service: "queue-job-service",
        });
    }

    /**
     * Get a QueueJob by ID
     *
     * @param id - Queue job ID
     * @returns QueueJob entity or null if not found
     * @throws Error if database operation fails
     */
    async getQueueJobById(id: number): Promise<QueueJob | null> {
        try {
            const queueJob = await queueJobsRepo.getQueueJobById(id);
            return queueJob;
        } catch (err) {
            this.logger.error(
                { queueJobId: id, err },
                "Failed to fetch QueueJob from database"
            );
            throw err;
        }
    }

    /**
     * Start processing a QueueJob
     *
     * Marks the job as PROCESSING status.
     *
     * @param id - Queue job ID
     * @returns Updated QueueJob entity
     * @throws Error if database operation fails
     */
    async startProcessing(id: number): Promise<QueueJob> {
        try {
            const queueJob = await queueJobsRepo.markAsProcessing(id);
            this.logger.debug(
                { queueJobId: id },
                "QueueJob marked as PROCESSING"
            );
            return queueJob;
        } catch (err) {
            this.logger.error(
                { queueJobId: id, err },
                "Failed to mark QueueJob as PROCESSING"
            );
            throw err;
        }
    }

    /**
     * Complete processing a QueueJob
     *
     * Marks the job as COMPLETED status with processed_at timestamp.
     *
     * @param id - Queue job ID
     * @returns Updated QueueJob entity
     * @throws Error if database operation fails
     */
    async completeProcessing(id: number): Promise<QueueJob> {
        try {
            const queueJob = await queueJobsRepo.markAsCompleted(id);
            this.logger.debug(
                { queueJobId: id },
                "QueueJob marked as COMPLETED"
            );
            return queueJob;
        } catch (err) {
            this.logger.error(
                { queueJobId: id, err },
                "Failed to mark QueueJob as COMPLETED"
            );
            throw err;
        }
    }

    /**
     * Handle processing failure with retry logic
     *
     * Determines whether to retry or mark as failed based on retry count.
     * If retries remain, increments retry count and marks as RETRYING.
     * If max retries exceeded, marks as FAILED.
     *
     * @param id - Queue job ID
     * @param currentRetryCount - Current retry count of the job
     * @param maxRetries - Maximum number of retries allowed
     * @param error - Error message or details
     * @param currentQueueJob - Current QueueJob entity (used as fallback if status update fails)
     * @returns Object with updated QueueJob and whether retry should occur
     * @throws Error if database operation fails (for retry case)
     */
    async handleProcessingFailure(
        id: number,
        currentRetryCount: number,
        maxRetries: number,
        error: string,
        currentQueueJob: QueueJob
    ): Promise<{ queueJob: QueueJob; shouldRetry: boolean }> {
        if (currentRetryCount < maxRetries) {
            // Retry available - increment retry count and mark as RETRYING
            try {
                const queueJob = await queueJobsRepo.incrementRetry(id);
                this.logger.info(
                    {
                        queueJobId: id,
                        retryCount: currentRetryCount + 1,
                        maxRetries,
                    },
                    "QueueJob marked for retry"
                );
                // Throw error to trigger RabbitMQ requeue
                return { queueJob, shouldRetry: true };
            } catch (err) {
                this.logger.error(
                    { queueJobId: id, err },
                    "Failed to increment retry count"
                );
                // Still throw to trigger requeue
                throw err;
            }
        } else {
            // Max retries exceeded - mark as FAILED
            try {
                const queueJob = await queueJobsRepo.markAsFailed(id, error);
                this.logger.error(
                    {
                        queueJobId: id,
                        retryCount: currentRetryCount,
                        maxRetries,
                    },
                    "QueueJob failed after max retries"
                );
                return { queueJob, shouldRetry: false };
            } catch (err) {
                this.logger.error(
                    { queueJobId: id, err },
                    "Failed to mark QueueJob as FAILED"
                );
                // Don't throw - acknowledge message even if status update fails
                // The job processing failed, we just couldn't update the status
                // Return the current job as fallback
                return { queueJob: currentQueueJob, shouldRetry: false };
            }
        }
    }
}

export default new QueueJobService();
