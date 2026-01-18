/**
 * @backtrade/logger
 *
 * Centralized logging package for BackTrade applications.
 * Provides a simple, consistent API for creating loggers across all apps.
 */

export { createLogger } from "./logger";
export type { Logger, LoggerConfig, ChildLoggerContext } from "./types";
export { defaultSerializers, errorSerializer } from "./serializers";
export {
    expressSerializers,
    requestSerializer,
    responseSerializer,
} from "./serializers/express";
export { createTransport } from "./transport";
export type { TransportConfig } from "./transport";
