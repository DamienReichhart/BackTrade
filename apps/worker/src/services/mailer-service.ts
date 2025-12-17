/**
 * Mailer Service
 *
 * Handles email sending operations with SMTP connection management.
 */

import mailer from "../libs/mailer";
import { ENV } from "../config/env";
import { logger } from "../libs/pino";
import { maskEmailForLogging } from "@backtrade/utils";

/**
 * Mailer Service
 *
 * Handles email sending operations with SMTP connection management.
 */
class MailerService {
    private readonly logger: ReturnType<typeof logger.child>;

    constructor() {
        this.logger = logger.child({
            service: "mailer-service",
        });
    }

    /**
     * Send an email
     *
     * @param to - Recipient email address
     * @param subject - Email subject
     * @param html - Email HTML content
     */
    async sendEmail(to: string, subject: string, html: string): Promise<void> {
        // Skip sending email if NEUTRALIZE_EMAIL is enabled
        if (ENV.NEUTRALIZE_EMAIL) {
            this.logger.info(
                { to: maskEmailForLogging(to), subject },
                "Email sending neutralized (NEUTRALIZE_EMAIL=true)"
            );
            return;
        }

        await mailer.sendMail({
            from: ENV.SMTP_FROM,
            to,
            subject,
            html,
        });
        this.logger.info(
            { to: maskEmailForLogging(to) },
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
            await mailer.verify();
            return true;
        } catch {
            return false;
        }
    }
}

export default new MailerService();
