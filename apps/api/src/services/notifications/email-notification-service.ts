/**
 * Email Notification Service
 *
 * High-level service for queuing application email notifications via RabbitMQ.
 * Messages are sent to RabbitMQ for processing by the worker.
 * Errors are thrown and must be handled by the caller.
 */

import { ENV } from "../../config/env";
import { logger } from "../../libs/logger/pino";
import {
    formatLoginDate,
    type DeviceInfo,
    maskEmailForLogging,
} from "../../utils";
import queueService from "../queue/queue-service";
import { MailMessageDataSchema } from "@backtrade/types";

/**
 * Email Notification Service
 *
 * Handles queuing application email notifications to RabbitMQ.
 * Messages are sent to RabbitMQ for processing by the worker.
 * Errors are thrown and must be handled by the caller.
 */
class EmailNotificationService {
    private readonly logger: ReturnType<typeof logger.child>;

    constructor() {
        this.logger = logger.child({
            service: "email-notification-service",
        });
    }

    /**
     * Queue welcome email after successful registration
     *
     * Queues the email message to RabbitMQ for processing by the worker.
     * Throws an error if queuing fails.
     *
     * @param email - Recipient email address
     * @param username - User's display name
     * @throws Error if message validation or queuing fails
     *
     * @example
     * ```ts
     * try {
     *   await emailNotificationService.sendWelcomeEmail("user@example.com", "John");
     * } catch (error) {
     *   // Handle error
     * }
     * ```
     */
    async sendWelcomeEmail(email: string, username: string): Promise<void> {
        this.logger.debug(
            { email: maskEmailForLogging(email), username },
            "Preparing welcome email message"
        );

        const mailMessage = {
            template: "welcome" as const,
            emailData: {
                to: email,
                subject: "Welcome to BackTrade!",
                username,
                dashboardUrl: `${ENV.FRONTEND_URL}/dashboard`,
            },
        };

        // Validate the mail message
        const validatedData = MailMessageDataSchema.parse(mailMessage);

        this.logger.debug(
            { email: maskEmailForLogging(email) },
            "Queueing welcome email message"
        );

        await queueService.queueMessage("mail", validatedData);

        this.logger.info(
            { email: maskEmailForLogging(email), username },
            "Welcome email message queued successfully"
        );
    }

    /**
     * Queue login notification email after successful login
     *
     * Queues the email message to RabbitMQ for processing by the worker.
     * Throws an error if queuing fails.
     *
     * @param email - Recipient email address
     * @param username - User's display name
     * @param loginDate - Login timestamp
     * @param deviceInfo - Device and browser information
     * @throws Error if message validation or queuing fails
     *
     * @example
     * ```ts
     * try {
     *   await emailNotificationService.sendLoginNotification(
     *     "user@example.com",
     *     "John",
     *     new Date(),
     *     { device: "Windows PC", browser: "Chrome 120" }
     *   );
     * } catch (error) {
     *   // Handle error
     * }
     * ```
     */
    async sendLoginNotification(
        email: string,
        username: string,
        loginDate: Date,
        deviceInfo: DeviceInfo
    ): Promise<void> {
        this.logger.debug(
            {
                email: maskEmailForLogging(email),
                username,
                device: deviceInfo.device,
            },
            "Preparing login notification email message"
        );

        const formattedDate = formatLoginDate(loginDate);

        const mailMessage = {
            template: "login-notification" as const,
            emailData: {
                to: email,
                subject: "New sign-in to your BackTrade account",
                username,
                loginDate: formattedDate,
                device: deviceInfo.device,
                browser: deviceInfo.browser,
                secureAccountUrl: `${ENV.FRONTEND_URL}/dashboard/settings`,
            },
        };

        // Validate the mail message
        const validatedData = MailMessageDataSchema.parse(mailMessage);

        this.logger.debug(
            { email: maskEmailForLogging(email) },
            "Queueing login notification email message"
        );

        await queueService.queueMessage("mail", validatedData);

        this.logger.info(
            {
                email: maskEmailForLogging(email),
                username,
                device: deviceInfo.device,
            },
            "Login notification email message queued successfully"
        );
    }
}

export default new EmailNotificationService();
