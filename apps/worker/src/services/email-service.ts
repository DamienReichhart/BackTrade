/**
 * Email Service
 *
 * Handles processing and sending email messages from the queue.
 * Validates mail message data and renders appropriate templates.
 */

import { logger } from "../libs/pino";
import mailerService from "./mailer-service";
import { templates } from "../email";
import {
    MailMessageDataSchema,
    type MailMessageData,
    type WelcomeEmailData,
    type LoginNotificationEmailData,
} from "@backtrade/types";
import { maskEmailForLogging } from "@backtrade/utils";

/**
 * Email Service
 *
 * Processes mail messages from the queue and sends emails.
 */
class EmailService {
    private readonly logger: ReturnType<typeof logger.child>;

    constructor() {
        this.logger = logger.child({
            service: "email-service",
        });
    }

    /**
     * Process and send an email message
     *
     * Validates the mail message data, renders the appropriate template,
     * and sends the email via the mailer service.
     *
     * @param mailData - Mail message data from the queue
     * @throws Error if validation fails or email sending fails
     */
    async processMailMessage(mailData: unknown): Promise<void> {
        // Validate the mail message data
        const validatedData = MailMessageDataSchema.parse(mailData);

        this.logger.debug(
            {
                template: validatedData.template,
                to: maskEmailForLogging(validatedData.emailData.to),
            },
            "Processing mail message"
        );

        // Render template and send email based on template type
        // TypeScript can't narrow the union type automatically, so we use type assertions
        // The schema validation ensures emailData matches the template type
        switch (validatedData.template) {
            case "welcome": {
                const emailData = validatedData.emailData as WelcomeEmailData;
                await this.sendWelcomeEmail(emailData);
                break;
            }
            case "login-notification": {
                const emailData =
                    validatedData.emailData as LoginNotificationEmailData;
                await this.sendLoginNotificationEmail(emailData);
                break;
            }
            default: {
                this.logger.error(
                    `Unknown email template type: ${(validatedData as MailMessageData).template}`
                );
            }
        }

        this.logger.info(
            {
                template: validatedData.template,
                to: maskEmailForLogging(validatedData.emailData.to),
            },
            "Email sent successfully"
        );
    }

    /**
     * Send welcome email
     *
     * @param data - Welcome email data
     */
    private async sendWelcomeEmail(data: WelcomeEmailData): Promise<void> {
        this.logger.debug(
            {
                to: maskEmailForLogging(data.to),
                username: data.username,
            },
            "Rendering welcome email template"
        );

        const html = await templates.register({
            username: data.username,
            dashboardUrl: data.dashboardUrl,
        });

        this.logger.debug(
            { to: maskEmailForLogging(data.to) },
            "Sending welcome email"
        );

        await mailerService.sendEmail(data.to, data.subject, html);
    }

    /**
     * Send login notification email
     *
     * @param data - Login notification email data
     */
    private async sendLoginNotificationEmail(
        data: LoginNotificationEmailData
    ): Promise<void> {
        this.logger.debug(
            {
                to: maskEmailForLogging(data.to),
                username: data.username,
                device: data.device,
            },
            "Rendering login notification email template"
        );

        const html = await templates.login({
            username: data.username,
            loginDate: data.loginDate,
            device: data.device,
            browser: data.browser,
            secureAccountUrl: data.secureAccountUrl,
        });

        this.logger.debug(
            { to: maskEmailForLogging(data.to) },
            "Sending login notification email"
        );

        await mailerService.sendEmail(data.to, data.subject, html);
    }
}

export default new EmailService();
