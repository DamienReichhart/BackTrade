import { createLogger, expressSerializers } from "@backtrade/logger";
import { ENV } from "../../config/env";

/**
 * Main logger instance for the API application
 * Uses @backtrade/logger package with Express serializers
 */
export const logger = createLogger({
    service: "api-backend",
    level: ENV.API_LOG_LEVEL,
    logDir: ENV.API_LOG_DIR,
    nodeEnv: ENV.NODE_ENV,
    serializers: expressSerializers,
});
