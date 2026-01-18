/**
 * Email Service
 *
 * Handles processing and sending email messages from the queue.
 * Validates mail message data and renders appropriate templates.
 */

import { logger } from "../libs/pino";
import mailerService from "./mailer-service";
import {
    createTemplateCompiler,
    createTemplateRenderer,
} from "@backtrade/mailer";
import {
    type MailMessageData,
    type WelcomeEmailData,
    type LoginNotificationEmailData,
    type AccountDeletedEmailData,
    type PasswordResetEmailData,
} from "@backtrade/types";
import { maskEmailForLogging } from "@backtrade/utils";

// Create template compiler and renderer instances
const templateCompiler = createTemplateCompiler({ logger });
const templateRenderer = createTemplateRenderer(templateCompiler);

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
    async processMailMessage(mailData: MailMessageData): Promise<void> {
        this.logger.debug(
            {
                template: mailData.template,
                to: maskEmailForLogging(mailData.emailData.to),
            },
            "Processing mail message"
        );

        // Render template and send email based on template type
        // TypeScript can't narrow the union type automatically, so we use type assertions
        // The schema validation ensures emailData matches the template type
        switch (mailData.template) {
            case "welcome": {
                const emailData = mailData.emailData as WelcomeEmailData;
                await this.sendWelcomeEmail(emailData);
                break;
            }
            case "login-notification": {
                const emailData =
                    mailData.emailData as LoginNotificationEmailData;
                await this.sendLoginNotificationEmail(emailData);
                break;
            }
            case "account-deleted": {
                const emailData = mailData.emailData as AccountDeletedEmailData;
                await this.sendAccountDeletedEmail(emailData);
                break;
            }
            case "password-reset": {
                const emailData = mailData.emailData as PasswordResetEmailData;
                await this.sendPasswordResetEmail(emailData);
                break;
            }
            default: {
                const errorMessage = `Unknown email template type: ${(mailData as MailMessageData).template}`;
                this.logger.error(errorMessage);
                throw new Error(errorMessage);
            }
        }

        this.logger.info(
            {
                template: mailData.template,
                to: maskEmailForLogging(mailData.emailData.to),
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

        const html = await templateRenderer.renderRegister({
            username: data.username,
            dashboardUrl: data.dashboardUrl,
        });

        this.logger.debug(
            { to: maskEmailForLogging(data.to) },
            "Sending welcome email"
        );

        await mailerService.sendEmail({
            to: data.to,
            subject: data.subject,
            html,
        });
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

        const html = await templateRenderer.renderLogin({
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

        await mailerService.sendEmail({
            to: data.to,
            subject: data.subject,
            html,
        });
    }

    /**
     * Send account deletion confirmation email
     *
     * @param data - Account deletion email data
     */
    private async sendAccountDeletedEmail(
        data: AccountDeletedEmailData
    ): Promise<void> {
        this.logger.debug(
            {
                to: maskEmailForLogging(data.to),
                username: data.username,
            },
            "Rendering account deletion confirmation email template"
        );

        const html = await templateRenderer.renderAccountDeleted({
            username: data.username,
            deletionDate: data.deletionDate,
            to: data.to,
            subject: data.subject,
        });

        this.logger.debug(
            { to: maskEmailForLogging(data.to) },
            "Sending account deletion confirmation email"
        );

        await mailerService.sendEmail({
            to: data.to,
            subject: data.subject,
            html,
        });
    }

    /**
     * Send password reset email
     *
     * @param data - Password reset email data
     */
    private async sendPasswordResetEmail(
        data: PasswordResetEmailData
    ): Promise<void> {
        this.logger.debug(
            {
                to: maskEmailForLogging(data.to),
                username: data.username,
            },
            "Rendering password reset email template"
        );

        const html = await templateRenderer.renderPasswordReset({
            username: data.username,
            resetCode: data.resetCode,
            expirationMinutes: data.expirationMinutes,
            to: data.to,
            subject: data.subject,
        });

        this.logger.debug(
            { to: maskEmailForLogging(data.to) },
            "Sending password reset email"
        );

        await mailerService.sendEmail({
            to: data.to,
            subject: data.subject,
            html,
        });
    }
}

export default new EmailService();
