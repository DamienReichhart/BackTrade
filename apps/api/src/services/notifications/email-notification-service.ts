/**
 * Email Notification Service
 *
 * High-level service for sending application email notifications.
 * Errors are logged but not propagated to callers.
 */

import {
    templates,
    type RegisterEmailData,
    type LoginEmailData,
} from "../../email";
import mailerService from "../utils/mailer-service";
import { ENV } from "../../config/env";
import { logger } from "../../libs/logger/pino";
import {
    formatLoginDate,
    type DeviceInfo,
    maskEmailForLogging,
} from "../../utils";

/**
 * Email Notification Service
 *
 * Handles sending application email notifications with fire-and-forget pattern.
 */
class EmailNotificationService {
    private readonly logger: ReturnType<typeof logger.child>;

    constructor() {
        this.logger = logger.child({
            service: "email-notification-service",
        });
    }

    /**
     * Fire-and-forget email sending helper
     *
     * Executes email sending asynchronously without blocking the caller.
     * Errors are logged but not propagated.
     *
     * @param emailType - Type of email being sent (for logging)
     * @param email - Recipient email address
     * @param sendFn - Async function that sends the email
     */
    private sendEmailFireAndForget(
        emailType: string,
        email: string,
        sendFn: () => Promise<void>
    ): void {
        sendFn().catch((error) => {
            this.logger.error(
                { error, email: maskEmailForLogging(email), emailType },
                `Failed to send ${emailType} email`
            );
        });
    }

    /**
     * Send welcome email after successful registration (fire-and-forget)
     *
     * Sends the email without blocking the caller.
     * Errors are logged but not propagated.
     *
     * @param email - Recipient email address
     * @param username - User's display name
     *
     * @example
     * ```ts
     * emailNotificationService.sendWelcomeEmail("user@example.com", "John");
     * ```
     */
    sendWelcomeEmail(email: string, username: string): void {
        this.sendEmailFireAndForget("welcome", email, async () => {
            this.logger.debug(
                { email: maskEmailForLogging(email), username },
                "Rendering welcome email template"
            );

            const templateData: RegisterEmailData = {
                username,
                dashboardUrl: `${ENV.FRONTEND_URL}/dashboard`,
            };

            const html = await templates.register(templateData);

            this.logger.debug(
                { email: maskEmailForLogging(email) },
                "Sending welcome email"
            );

            await mailerService.sendEmail(email, "Welcome to BackTrade!", html);

            this.logger.info(
                { email: maskEmailForLogging(email), username },
                "Welcome email sent successfully"
            );
        });
    }

    /**
     * Send login notification email after successful login (fire-and-forget)
     *
     * Sends the email without blocking the caller.
     * Errors are logged but not propagated.
     *
     * @param email - Recipient email address
     * @param username - User's display name
     * @param loginDate - Login timestamp
     * @param deviceInfo - Device and browser information
     *
     * @example
     * ```ts
     * emailNotificationService.sendLoginNotification(
     *   "user@example.com",
     *   "John",
     *   new Date(),
     *   { device: "Windows PC", browser: "Chrome 120" }
     * );
     * ```
     */
    sendLoginNotification(
        email: string,
        username: string,
        loginDate: Date,
        deviceInfo: DeviceInfo
    ): void {
        this.sendEmailFireAndForget("login notification", email, async () => {
            this.logger.debug(
                {
                    email: maskEmailForLogging(email),
                    username,
                    device: deviceInfo.device,
                },
                "Rendering login notification template"
            );

            const formattedDate = formatLoginDate(loginDate);

            const templateData: LoginEmailData = {
                username,
                loginDate: formattedDate,
                device: deviceInfo.device,
                browser: deviceInfo.browser,
                secureAccountUrl: `${ENV.FRONTEND_URL}/dashboard/settings`,
            };

            const html = await templates.login(templateData);

            this.logger.debug(
                { email: maskEmailForLogging(email) },
                "Sending login notification email"
            );

            await mailerService.sendEmail(
                email,
                "New sign-in to your BackTrade account",
                html
            );

            this.logger.info(
                {
                    email: maskEmailForLogging(email),
                    username,
                    device: deviceInfo.device,
                },
                "Login notification email sent successfully"
            );
        });
    }
}

export default new EmailNotificationService();
