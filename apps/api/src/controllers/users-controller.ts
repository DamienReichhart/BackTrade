/**
 * Users Controller
 *
 * Handles user-related HTTP requests.
 * Orchestrates user service operations.
 */

import type { Request, Response } from "express";
import usersService from "../services/base/users-service";
import { logger } from "../libs/pino";
import type { ChangeUserPasswordRequest } from "@backtrade/types";

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

    /**
     * Change user password
     *
     * Users can change their own password by providing their current password.
     * Admins can change any user's password without providing the current password.
     *
     * @param req - Express request object (must have req.user set by authMiddleware)
     * @param res - Express response object
     */
    async changePassword(req: Request, res: Response): Promise<void> {
        if (!req.user) {
            this.logger.error(
                "changePassword called without authenticated user"
            );
            throw new Error("User not authenticated");
        }

        const { id } = req.params;
        const { currentPassword, newPassword } =
            req.body as ChangeUserPasswordRequest;

        await usersService.changePassword(
            Number(id),
            currentPassword ?? "",
            newPassword,
            req.user
        );

        res.status(200).json({ message: "Password changed successfully" });
    }
}

export default new UsersController();
