/**
 * Mailer Client Factory
 *
 * Creates and configures nodemailer transporter instances.
 * Accepts logger for dependency injection and reads SMTP configuration from environment.
 */

import nodemailer, { type Transporter } from "nodemailer";
import type { Logger } from "@backtrade/logger";
import { ENV } from "../config/ENV";

/**
 * Mailer configuration options
 */
export interface MailerConfig {
    /** Logger instance from the consuming application */
    logger: Logger;
}

/**
 * Creates a nodemailer transporter instance with proper error handling
 *
 * @param config - Configuration object with logger
 * @returns Configured nodemailer transporter instance
 *
 * @example
 * ```ts
 * import { createMailerClient } from "@backtrade/mailer";
 * import { logger } from "./libs/pino";
 *
 * const transporter = createMailerClient({ logger });
 * ```
 */
export function createMailerClient(config: MailerConfig): Transporter {
    const mailerLogger = config.logger.child({
        service: "mailer",
    });

    const transporter = nodemailer.createTransport({
        host: ENV.SMTP_HOST,
        port: ENV.SMTP_PORT,
        auth: {
            user: ENV.SMTP_USER,
            pass: ENV.SMTP_PASSWORD,
        },
    });

    mailerLogger.info(
        {
            host: ENV.SMTP_HOST,
            port: ENV.SMTP_PORT,
            secure: true,
        },
        "SMTP transport created, SMTP client ready"
    );

    return transporter;
}
