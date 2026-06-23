/**
 * Email Notification Service
 *
 * High-level service for queuing application email notifications via RabbitMQ.
 * Messages are sent to RabbitMQ for processing by the worker.
 * Errors are thrown and must be handled by the caller.
 */

import { ENV } from "../../config/env";
import { formatDate, type DeviceInfo, maskEmailForLogging } from "../../utils";
import { BaseService } from "../base/base-service";
import queueService from "../queue/queue-service";
import { MailMessageDataSchema, QueueName } from "@backtrade/types";

/**
 * Email Notification Service
 *
 * Handles queuing application email notifications to RabbitMQ.
 * Messages are sent to RabbitMQ for processing by the worker.
 * Errors are thrown and must be handled by the caller.
 */
class EmailNotificationService extends BaseService {
    constructor() {
        super("email-notification-service");
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
                subject: "Welcome to BackTrade",
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

        await queueService.queueMessage(QueueName.mail, validatedData);

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

        const formattedDate = formatDate(loginDate);

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

        await queueService.queueMessage(QueueName.mail, validatedData);

        this.logger.info(
            {
                email: maskEmailForLogging(email),
                username,
                device: deviceInfo.device,
            },
            "Login notification email message queued successfully"
        );
    }

    /**
     * Queue account deletion confirmation email after successful account deletion
     *
     * Queues the email message to RabbitMQ for processing by the worker.
     * Throws an error if queuing fails.
     *
     * @param email - Recipient email address
     * @param username - User's display name or email
     * @param deletionDate - Deletion timestamp
     * @throws Error if message validation or queuing fails
     *
     * @example
     * ```ts
     * try {
     *   await emailNotificationService.sendAccountDeletedEmail(
     *     "user@example.com",
     *     "John",
     *     new Date()
     *   );
     * } catch (error) {
     *   // Handle error
     * }
     * ```
     */
    async sendAccountDeletedEmail(
        email: string,
        username: string,
        deletionDate: Date
    ): Promise<void> {
        this.logger.debug(
            { email: maskEmailForLogging(email), username },
            "Preparing account deletion confirmation email message"
        );

        const formattedDate = formatDate(deletionDate);

        const mailMessage = {
            template: "account-deleted" as const,
            emailData: {
                to: email,
                subject: "Your BackTrade account has been deleted",
                username,
                deletionDate: formattedDate,
            },
        };

        // Validate the mail message
        const validatedData = MailMessageDataSchema.parse(mailMessage);

        this.logger.debug(
            { email: maskEmailForLogging(email) },
            "Queueing account deletion confirmation email message"
        );

        await queueService.queueMessage(QueueName.mail, validatedData);

        this.logger.info(
            { email: maskEmailForLogging(email), username },
            "Account deletion confirmation email message queued successfully"
        );
    }

    /**
     * Queue password reset email with verification code
     *
     * Queues the email message to RabbitMQ for processing by the worker.
     * Throws an error if queuing fails.
     *
     * @param email - Recipient email address
     * @param username - User's display name or email
     * @param resetCode - Password reset verification code
     * @param expirationMinutes - Code expiration time in minutes
     * @throws Error if message validation or queuing fails
     *
     * @example
     * ```ts
     * try {
     *   await emailNotificationService.sendPasswordResetEmail(
     *     "user@example.com",
     *     "John",
     *     "123456",
     *     15
     *   );
     * } catch (error) {
     *   // Handle error
     * }
     * ```
     */
    async sendPasswordResetEmail(
        email: string,
        username: string,
        resetCode: string,
        expirationMinutes: number
    ): Promise<void> {
        this.logger.debug(
            { email: maskEmailForLogging(email), username },
            "Preparing password reset email message"
        );

        const mailMessage = {
            template: "password-reset" as const,
            emailData: {
                to: email,
                subject: "Reset your BackTrade password",
                username,
                resetCode,
                expirationMinutes,
            },
        };

        // Validate the mail message
        const validatedData = MailMessageDataSchema.parse(mailMessage);

        this.logger.debug(
            { email: maskEmailForLogging(email) },
            "Queueing password reset email message"
        );

        await queueService.queueMessage(QueueName.mail, validatedData);

        this.logger.info(
            { email: maskEmailForLogging(email), username },
            "Password reset email message queued successfully"
        );
    }
}

export default new EmailNotificationService();
