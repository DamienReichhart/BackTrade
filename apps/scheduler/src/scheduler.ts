import { logger } from "./libs/pino";
import { QueueRetryService } from "./services/queue-retry-service";
import { ENV } from "./config/env";
import { close as closeRabbitMQ } from "./libs/rabbitmq";

const schedulerLogger = logger.child({ module: "scheduler" });

let retryService: QueueRetryService | null = null;

/**
 * Start the scheduler
 */
async function startScheduler(): Promise<void> {
    try {
        schedulerLogger.info("Starting scheduler...");

        // Initialize retry service
        retryService = new QueueRetryService({
            cronSchedule: ENV.QUEUE_RETRY_CRON,
            batchSize: ENV.QUEUE_RETRY_BATCH_SIZE,
            initialBackoffMs: ENV.QUEUE_RETRY_INITIAL_BACKOFF_MS,
            backoffMultiplier: ENV.QUEUE_RETRY_BACKOFF_MULTIPLIER,
            maxRetries: ENV.QUEUE_RETRY_MAX_RETRIES,
            maxBackoffMs: ENV.QUEUE_RETRY_MAX_BACKOFF_MS,
            enabled: ENV.QUEUE_RETRY_ENABLED,
        });

        // Start retry service if enabled
        if (ENV.QUEUE_RETRY_ENABLED) {
            retryService.start();
            schedulerLogger.info("Queue retry service started");
        } else {
            schedulerLogger.info("Queue retry service disabled");
        }

        schedulerLogger.info("Scheduler started successfully");
    } catch (err) {
        schedulerLogger.error(err, "Failed to start scheduler");
        process.exit(1);
    }
}

/**
 * Stop the scheduler gracefully
 */
async function stopScheduler(): Promise<void> {
    schedulerLogger.info("Stopping scheduler...");

    if (retryService) {
        await retryService.stop();
        retryService = null;
    }

    await closeRabbitMQ();

    schedulerLogger.info("Scheduler stopped");
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
    schedulerLogger.info("Received SIGINT, shutting down gracefully...");
    await stopScheduler();
    process.exit(0);
});

process.on("SIGTERM", async () => {
    schedulerLogger.info("Received SIGTERM, shutting down gracefully...");
    await stopScheduler();
    process.exit(0);
});

// Start the scheduler
void startScheduler();
