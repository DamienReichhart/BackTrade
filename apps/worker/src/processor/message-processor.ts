import { logger } from "../libs/pino";
import type { QueueJobMessage } from "@backtrade/types";
import queueJobService from "../services/queue-job-service";
import emailService from "../services/email-service";

const messageProcessorLogger = logger.child({
    service: "message-processor",
});

/**
 * Maximum number of retries before marking a job as permanently failed
 */
const MAX_RETRIES = 3;

/**
 * Processes a message from the queue
 *
 * Fetches the QueueJob from the database using the queueJobId from the message,
 * updates its status, processes it, and handles retries and errors.
 */
async function processMessage(message: QueueJobMessage): Promise<void> {
    const { queueJobId, type } = message;

    messageProcessorLogger.info({ queueJobId, type }, "Processing message");

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
        messageProcessorLogger.error(
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
            case "data-processing":
                await processDataProcessing(queueJob.payload);
                break;
            case "mail":
                await processMailMessage(queueJob.payload);
                break;
            default:
                messageProcessorLogger.warn(
                    { queueJobId, type },
                    "Unknown message type"
                );
                throw new Error(`Unknown message type: ${type}`);
        }

        // Mark as completed on success
        await queueJobService.completeProcessing(queueJobId);

        messageProcessorLogger.info(
            { queueJobId, type },
            "QueueJob processed successfully"
        );
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);

        messageProcessorLogger.error(
            { queueJobId, type, err },
            "Failed to process QueueJob"
        );

        // Handle retry logic using service
        const { shouldRetry } = await queueJobService.handleProcessingFailure(
            queueJobId,
            queueJob.retry_count,
            MAX_RETRIES,
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
 * Processes data processing messages
 */
async function processDataProcessing(data: unknown): Promise<void> {
    messageProcessorLogger.info({ data }, "Processing data");

    // TODO: Implement actual data processing logic here
    // For now, just log the data
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate processing

    messageProcessorLogger.info("Data processing completed");
}

/**
 * Processes mail messages
 *
 * @param data - Mail message data
 */
async function processMailMessage(data: unknown): Promise<void> {
    messageProcessorLogger.debug({ data }, "Processing mail message");

    await emailService.processMailMessage(data);

    messageProcessorLogger.info("Mail message processed successfully");
}

export default {
    processMessage,
};
