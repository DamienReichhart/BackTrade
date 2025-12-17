/**
 * Mailer Service
 *
 * Handles email sending operations with SMTP connection management.
 * Provides a clean interface for sending emails with template rendering support.
 */

import type { Transporter } from "nodemailer";
import type { Logger } from "@backtrade/logger";
import { ENV } from "../config/ENV";
import { maskEmailForLogging } from "@backtrade/utils";

/**
 * Mailer service configuration
 */
export interface MailerServiceConfig {
    /** Nodemailer transporter instance */
    transporter: Transporter;
    /** Logger instance from the consuming application */
    logger: Logger;
}

/**
 * Email sending options
 */
export interface SendEmailOptions {
    /** Recipient email address */
    to: string;
    /** Email subject */
    subject: string;
    /** Email HTML content */
    html: string;
    /** Optional sender email (defaults to SMTP_FROM) */
    from?: string;
}

/**
 * Mailer Service
 *
 * Handles email sending operations with SMTP connection management.
 */
export class MailerService {
    private readonly transporter: Transporter;
    private readonly logger: ReturnType<Logger["child"]>;

    constructor(config: MailerServiceConfig) {
        this.transporter = config.transporter;
        this.logger = config.logger.child({
            service: "mailer-service",
        });
    }

    /**
     * Send an email
     *
     * @param options - Email sending options
     * @throws Error if email sending fails
     *
     * @example
     * ```ts
     * await mailerService.sendEmail({
     *   to: "user@example.com",
     *   subject: "Welcome!",
     *   html: "<h1>Welcome</h1>"
     * });
     * ```
     */
    async sendEmail(options: SendEmailOptions): Promise<void> {
        // Skip sending email if NEUTRALIZE_EMAIL is enabled
        if (ENV.NEUTRALIZE_EMAIL) {
            this.logger.info(
                {
                    to: maskEmailForLogging(options.to),
                    subject: options.subject,
                },
                "Email sending neutralized (NEUTRALIZE_EMAIL=true)"
            );
            return;
        }

        await this.transporter.sendMail({
            from: options.from ?? ENV.SMTP_FROM,
            to: options.to,
            subject: options.subject,
            html: options.html,
        });

        this.logger.info(
            { to: maskEmailForLogging(options.to) },
            "Email sent successfully"
        );
    }

    /**
     * Check SMTP connection
     *
     * @returns True if connection is successful, false otherwise
     */
    async checkConnection(): Promise<boolean> {
        try {
            await this.transporter.verify();
            return true;
        } catch {
            return false;
        }
    }
}
