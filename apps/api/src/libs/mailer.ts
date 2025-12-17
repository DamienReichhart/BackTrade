/**
 * Mailer Client
 *
 * Mailer client instance using @backtrade/mailer package.
 * This file provides a singleton mailer service for the API application.
 */

import { createMailerClient, createMailerService } from "@backtrade/mailer";
import { logger } from "./pino";

// Create mailer client and service instances
const transporter = createMailerClient({ logger });
export const mailerService = createMailerService({
    transporter,
    logger,
});
