import cron, { type ScheduledTask } from "node-cron";
import { logger } from "../libs/pino";
import { publishMessage } from "../libs/rabbitmq";
import { queueJobsRepo } from "@backtrade/data";
import type { QueueJob, QueueJobMessage } from "@backtrade/types";

/**
 * Configuration for QueueRetryService
 */
export interface QueueRetryServiceConfig {
    cronSchedule: string;
    batchSize: number;
    initialBackoffMs: number;
    backoffMultiplier: number;
    maxRetries: number;
    maxBackoffMs: number;
    enabled: boolean;
}

/**
 * Queue Retry Service
 *
 * Handles retrying QUEUE_FAILED jobs with exponential backoff.
 * Periodically queries for failed jobs and attempts to republish them to RabbitMQ.
 */
export class QueueRetryService {
    private readonly logger: ReturnType<typeof logger.child>;
    private scheduledTask: ScheduledTask | null = null;
    private isProcessing = false;
    private readonly config: QueueRetryServiceConfig;

    constructor(config: QueueRetryServiceConfig) {
        this.config = config;
        this.logger = logger.child({
            service: "queue-retry-service",
        });
    }

    /**
     * Start the retry service
     *
     * Initializes and starts the cron job to periodically process retries.
     */
    start(): void {
        if (this.scheduledTask) {
            this.logger.warn("Retry service is already running");
            return;
        }

        if (!this.config.enabled) {
            this.logger.info("Retry service is disabled");
            return;
        }

        // Validate cron expression
        if (!cron.validate(this.config.cronSchedule)) {
            this.logger.error(
                { cronSchedule: this.config.cronSchedule },
                "Invalid cron schedule"
            );
            throw new Error(
                `Invalid cron schedule: ${this.config.cronSchedule}`
            );
        }

        this.scheduledTask = cron.schedule(
            this.config.cronSchedule,
            () => {
                void this.processRetries();
            },
            {
                timezone: "UTC",
            }
        );

        this.logger.info(
            {
                cronSchedule: this.config.cronSchedule,
                batchSize: this.config.batchSize,
            },
            "Queue retry service started"
        );
    }

    /**
     * Stop the retry service
     *
     * Stops the cron job and waits for any in-flight processing to complete.
     */
    async stop(): Promise<void> {
        if (this.scheduledTask) {
            this.scheduledTask.stop();
            this.scheduledTask = null;
            this.logger.info("Queue retry service stopped");

            // Wait for in-flight processing to complete (with timeout)
            const timeout = 30000; // 30 seconds
            const startTime = Date.now();
            while (this.isProcessing && Date.now() - startTime < timeout) {
                await new Promise((resolve) => setTimeout(resolve, 100));
            }

            if (this.isProcessing) {
                this.logger.warn(
                    "Retry service stopped but processing was still in progress"
                );
            }
        }
    }

    /**
     * Process retries for QUEUE_FAILED jobs
     *
     * Queries for ready jobs, claims them atomically, and attempts to republish.
     */
    private async processRetries(): Promise<void> {
        // Prevent overlapping executions
        if (this.isProcessing) {
            this.logger.warn(
                "Previous retry processing still in progress, skipping this run"
            );
            return;
        }

        this.isProcessing = true;
        const startTime = Date.now();

        try {
            this.logger.debug("Starting retry batch processing");

            // Query for jobs ready for retry
            const jobs = await queueJobsRepo.getQueueFailedJobsReadyForRetry(
                this.config.batchSize
            );

            if (jobs.length === 0) {
                this.logger.debug("No jobs ready for retry");
                return;
            }

            this.logger.info(
                { jobCount: jobs.length },
                `Processing ${jobs.length} job(s) for retry`
            );

            let successCount = 0;
            let failureCount = 0;
            let permanentFailureCount = 0;
            let skippedCount = 0;

            // Process each job
            for (const job of jobs) {
                try {
                    const result = await this.retryJob(job);
                    if (result === "success") {
                        successCount++;
                    } else if (result === "permanent_failure") {
                        permanentFailureCount++;
                    } else if (result === "skipped") {
                        skippedCount++;
                    } else {
                        failureCount++;
                    }
                } catch (err) {
                    failureCount++;
                    this.logger.error(
                        { queueJobId: job.id, err },
                        "Unexpected error while processing job retry"
                    );
                }
            }

            const duration = Date.now() - startTime;
            this.logger.info(
                {
                    total: jobs.length,
                    success: successCount,
                    failure: failureCount,
                    permanentFailure: permanentFailureCount,
                    skipped: skippedCount,
                    duration,
                },
                "Retry batch processing completed"
            );
        } catch (err) {
            this.logger.error(err, "Failed to process retries");
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Retry a single job
     *
     * Atomically claims the job, attempts to republish, and updates status accordingly.
     *
     * @param job - The queue job to retry
     * @returns Result of the retry attempt
     */
    private async retryJob(
        job: QueueJob
    ): Promise<"success" | "failure" | "permanent_failure" | "skipped"> {
        // Atomically claim the job
        const claimedJob = await queueJobsRepo.atomicallyClaimQueueFailedJob(
            job.id
        );

        if (!claimedJob) {
            // Job was already claimed by another process
            this.logger.debug(
                { queueJobId: job.id },
                "Job already claimed by another process, skipping"
            );
            return "skipped";
        }

        try {
            // Create message for RabbitMQ
            const message: QueueJobMessage = {
                type: job.type,
                queueJobId: job.id,
                timestamp: new Date().toISOString(),
            };

            // Attempt to republish
            await publishMessage(message);

            // Success - mark as PENDING (will be picked up by worker)
            await queueJobsRepo.markAsQueued(job.id);

            this.logger.info(
                {
                    queueJobId: job.id,
                    type: job.type,
                    retryCount: job.retry_count,
                },
                "Job successfully republished to RabbitMQ"
            );

            return "success";
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : String(err);
            const newRetryCount = job.retry_count + 1;

            // Check if max retries exceeded
            if (newRetryCount > this.config.maxRetries) {
                // Mark as permanently failed
                await queueJobsRepo.markAsPermanentlyFailed(
                    job.id,
                    `Max retries (${this.config.maxRetries}) exceeded. Last error: ${errorMessage}`
                );

                this.logger.error(
                    {
                        queueJobId: job.id,
                        type: job.type,
                        retryCount: newRetryCount,
                        maxRetries: this.config.maxRetries,
                        error: errorMessage,
                    },
                    "Job marked as permanently failed after exceeding max retries"
                );

                return "permanent_failure";
            }

            // Calculate next attempt time with exponential backoff
            const nextAttemptAt = this.calculateNextAttemptAt(newRetryCount);

            // Update retry metadata
            await queueJobsRepo.updateRetryMetadata(
                job.id,
                newRetryCount,
                nextAttemptAt,
                errorMessage
            );

            this.logger.warn(
                {
                    queueJobId: job.id,
                    type: job.type,
                    retryCount: newRetryCount,
                    maxRetries: this.config.maxRetries,
                    nextAttemptAt: nextAttemptAt.toISOString(),
                    error: errorMessage,
                },
                "Job retry failed, scheduled for next attempt"
            );

            return "failure";
        }
    }

    /**
     * Calculate the next attempt time using exponential backoff
     *
     * Formula: min(initialBackoff * (multiplier ^ retryCount), maxBackoff)
     *
     * @param retryCount - Current retry count (0-indexed, so use retryCount + 1 for calculation)
     * @returns Date for the next retry attempt
     */
    private calculateNextAttemptAt(retryCount: number): Date {
        const backoffMs = Math.min(
            this.config.initialBackoffMs *
                Math.pow(this.config.backoffMultiplier, retryCount),
            this.config.maxBackoffMs
        );

        const nextAttemptAt = new Date();
        nextAttemptAt.setTime(nextAttemptAt.getTime() + backoffMs);

        return nextAttemptAt;
    }
}
