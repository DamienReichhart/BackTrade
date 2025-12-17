import { createLogger } from "@backtrade/logger";
import { ENV } from "../config/env";

/**
 * Main logger instance for the Worker application
 * Uses @backtrade/logger package
 */
export const logger = createLogger({
    service: "data-worker",
    level: ENV.WORKER_LOG_LEVEL,
    logDir: ENV.WORKER_LOG_DIR,
    nodeEnv: ENV.NODE_ENV,
});
