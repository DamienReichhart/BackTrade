/**
 * Mailer Service
 *
 * Handles email sending operations with SMTP connection management.
 * This is a wrapper around the @backtrade/mailer package for the worker app.
 */

import { createMailerClient, createMailerService } from "@backtrade/mailer";
import { logger } from "../libs/pino";

// Create mailer client and service instances
const transporter = createMailerClient({ logger });
const mailerService = createMailerService({
    transporter,
    logger,
});

export default mailerService;
