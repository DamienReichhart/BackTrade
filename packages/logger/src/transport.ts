import path from "node:path";
import type { TransportTargetOptions } from "pino";
import type { LogLevel, NodeEnv } from "@backtrade/types";

/**
 * Configuration for creating transport targets
 */
export interface TransportConfig {
    /**
     * Log level for the transport
     */
    level: LogLevel;

    /**
     * Node environment
     */
    nodeEnv: NodeEnv;

    /**
     * Directory where log files will be stored
     */
    logDir: string;

    /**
     * Whether to disable file logging
     */
    disableFileLogging?: boolean;
}

/**
 * Creates transport targets for pino logger
 *
 * @param config - Transport configuration
 * @returns Array of transport targets
 */
export function createTransport(config: TransportConfig): {
    targets: TransportTargetOptions[];
} {
    const targets: TransportTargetOptions[] = [];

    // stdout - pretty in development, plain JSON in production
    if (config.nodeEnv === "production") {
        targets.push({
            target: "pino/file",
            options: { destination: 1 },
            level: config.level,
        });
    } else {
        targets.push({
            target: "pino-pretty",
            options: {
                colorize: true,
                translateTime: "HH:MM:ss.l",
                ignore: "pid,hostname",
                singleLine: false,
                messageFormat: "{module} {msg}",
                errorLikeObjectKeys: ["err", "error"],
            },
            level: config.level,
        });
    }

    // File logging (if not disabled)
    if (!config.disableFileLogging) {
        const getLogFilePath = (filename: string): string => {
            return path.resolve(config.logDir, filename);
        };

        // app.log - all logs
        targets.push({
            target: "pino/file",
            options: {
                destination: getLogFilePath("app.log"),
                mkdir: true,
            },
            level: config.level,
        });

        // error.log - only error level and above
        targets.push({
            target: "pino/file",
            options: {
                destination: getLogFilePath("error.log"),
                mkdir: true,
            },
            level: "error",
        });
    }

    return { targets };
}
