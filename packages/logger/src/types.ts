import type { Logger as PinoLogger, SerializerFn } from "pino";
import type { LogLevel, NodeEnv } from "@backtrade/types";

/**
 * Configuration for creating a logger instance
 */
export interface LoggerConfig {
    /**
     * Service name to identify the application/service in logs
     */
    service: string;

    /**
     * Log level (default: "info")
     */
    level?: LogLevel;

    /**
     * Directory where log files will be stored (default: ".")
     */
    logDir?: string;

    /**
     * Node environment (default: "development")
     */
    nodeEnv?: NodeEnv;

    /**
     * Custom serializers to extend or override default serializers
     */
    serializers?: Record<string, SerializerFn>;

    /**
     * Whether to disable file logging (default: false)
     */
    disableFileLogging?: boolean;
}

/**
 * Logger instance type (Pino logger with child method)
 */
export type Logger = PinoLogger;

/**
 * Child logger context
 */
export interface ChildLoggerContext {
    [key: string]: unknown;
}
