/**
 * Users Controller
 *
 * Handles user-related HTTP requests.
 * Orchestrates user service operations.
 */

import type { Request, Response } from "express";
import usersService from "../services/base/users-service";
import { logger } from "../libs/pino";

/**
 * Users Controller
 *
 * Handles user-related HTTP requests.
 * Orchestrates user service operations.
 */
class UsersController {
    private readonly logger: ReturnType<typeof logger.child>;

    constructor() {
        this.logger = logger.child({
            service: "users-controller",
        });
    }

    /**
     * Get user by ID
     *
     * @param req - Express request object
     * @param res - Express response object
     */
    async getUserById(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const user = await usersService.getUserById(Number(id));
        res.status(200).json(user);
    }
}

export default new UsersController();
