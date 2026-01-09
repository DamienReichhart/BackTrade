/**
 * Base Service Class
 *
 * Abstract base class that provides common functionality for all services.
 * Eliminates duplication of logger initialization and provides a consistent
 * pattern for service construction.
 */

import { logger } from "../../libs/pino";

/**
 * Logger type derived from pino child logger
 */
export type ServiceLogger = ReturnType<typeof logger.child>;

/**
 * Abstract base service class
 *
 * All services should extend this class to inherit:
 * - Standardized logger initialization with service name
 * - Type-safe logger access via protected property
 *
 * @example
 * ```typescript
 * class PositionsService extends BaseService {
 *     constructor() {
 *         super("positions-service");
 *     }
 *
 *     async getPosition(id: string) {
 *         this.logger.trace({ id }, "Fetching position");
 *         // ... implementation
 *     }
 * }
 * ```
 */
export abstract class BaseService {
    /**
     * Service-specific logger instance
     * Child logger of the main application logger with service context
     */
    protected readonly logger: ServiceLogger;

    /**
     * Initialize the service with a named logger
     *
     * @param serviceName - Name of the service for log identification
     */
    constructor(serviceName: string) {
        this.logger = logger.child({ service: serviceName });
    }
}
