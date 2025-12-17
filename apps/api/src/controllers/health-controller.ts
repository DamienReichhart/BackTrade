/**
 * Health Controller
 *
 * Handles health check HTTP requests.
 * Orchestrates health service operations.
 */

import { type Request, type Response } from "express";
import healthService from "../services/utils/health-service";
import { logger } from "../libs/logger/pino";

/**
 * Health Controller
 *
 * Handles health check HTTP requests.
 * Orchestrates health service operations.
 */
class HealthController {
    private readonly logger: ReturnType<typeof logger.child>;

    constructor() {
        this.logger = logger.child({
            service: "health-controller",
        });
    }

    /**
     * Get system health status
     *
     * @param _req - Express request object
     * @param res - Express response object
     */
    async getHealth(_req: Request, res: Response): Promise<void> {
        const health = await healthService.getHealth();
        res.status(200).json(health);
    }
}

export default new HealthController();
