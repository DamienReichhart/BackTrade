import { createLogger } from "@backtrade/logger";
import { ENV } from "../config/env";

/**
 * Main logger instance for the Scheduler application
 * Uses @backtrade/logger package
 */
export const logger = createLogger({
    service: "scheduler",
    level: ENV.SCHEDULER_LOG_LEVEL,
    logDir: ENV.SCHEDULER_LOG_DIR,
    nodeEnv: ENV.NODE_ENV,
});
