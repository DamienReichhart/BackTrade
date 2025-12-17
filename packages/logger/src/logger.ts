import pino from "pino";
import type { Logger, LoggerConfig } from "./types";
import { createTransport } from "./transport";
import { defaultSerializers } from "./serializers";

/**
 * Creates a configured pino logger instance
 *
 * @param config - Logger configuration
 * @returns Configured logger instance that supports child loggers
 *
 * @example
 * ```typescript
 * const logger = createLogger({
 *   service: "api-backend",
 *   level: "info",
 *   logDir: "./logs",
 *   nodeEnv: "production"
 * });
 *
 * // Create a child logger
 * const childLogger = logger.child({ module: "users" });
 * childLogger.info("User service initialized");
 * ```
 */
export function createLogger(config: LoggerConfig): Logger {
    const {
        service,
        level = "info",
        logDir = ".",
        nodeEnv = "development",
        serializers: customSerializers,
        disableFileLogging = false,
    } = config;

    // Merge default serializers with custom serializers (custom takes precedence)
    const serializers = {
        ...defaultSerializers,
        ...customSerializers,
    };

    // Create transport configuration
    const transport = createTransport({
        level,
        nodeEnv,
        logDir,
        disableFileLogging,
    });

    // Create and return pino logger
    return pino({
        level,
        serializers,
        base: {
            pid: false,
            service,
        },
        ...transport,
    });
}
