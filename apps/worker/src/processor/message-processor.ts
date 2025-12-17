import { logger } from "../libs/logger/pino";
import type { QueueMessage } from "@backtrade/types";
import emailService from "../services/email-service";

const messageProcessorLogger = logger.child({
    service: "message-processor",
});

/**
 * Processes a message from the queue
 */
async function processMessage(message: QueueMessage): Promise<void> {
    messageProcessorLogger.info(
        { messageId: message.id, type: message.type },
        "Processing message"
    );

    try {
        // Process message based on type
        switch (message.type) {
            case "data-processing":
                await processDataProcessing(message.data);
                break;
            case "mail":
                await processMailMessage(message.data);
                break;
            default:
                messageProcessorLogger.warn(
                    { type: message.type },
                    "Unknown message type"
                );
        }

        messageProcessorLogger.debug(
            { messageId: message.id },
            "Message processed successfully"
        );
    } catch (err) {
        messageProcessorLogger.error(
            { messageId: message.id, err },
            "Failed to process message"
        );
        throw err;
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
