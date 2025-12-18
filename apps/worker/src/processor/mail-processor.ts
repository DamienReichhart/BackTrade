/**
 * Mail Processor
 *
 * Handles processing of mail queue messages.
 * Processes mail messages and delegates to the email service for sending.
 */

import { MailMessageDataSchema } from "@backtrade/types";
import { logger } from "../libs/pino";
import emailService from "../services/email-service";

/**
 * Mail Processor
 *
 * Processes mail messages from the queue.
 */
class MailProcessor {
    private readonly logger: ReturnType<typeof logger.child>;

    constructor() {
        this.logger = logger.child({
            service: "mail-processor",
        });
    }

    /**
     * Process mail message
     *
     * Processes a mail message from the queue and sends it via the email service.
     *
     * @param data - Mail message data
     * @throws Error if validation fails or email sending fails
     */
    async process(data: unknown): Promise<void> {
        this.logger.debug({ data }, "Processing mail message");
        const validatedData = MailMessageDataSchema.parse(data);

        await emailService.processMailMessage(validatedData);

        this.logger.info("Mail message processed successfully");
    }
}

export default new MailProcessor();
