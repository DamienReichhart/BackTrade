/**
 * Users Controller
 *
 * Handles user-related HTTP requests.
 * Orchestrates user service operations.
 *
 * Note: Methods that require authentication assume req.user is set by authMiddleware.
 * Routes using those methods must be protected by authMiddleware.
 */

import type { Request, Response } from "express";
import usersService from "../services/base/users-service";
import { logger } from "../libs/pino";
import {
    type ChangeUserPasswordRequest,
    type UpdateUserRequest,
    PublicUserSchema,
} from "@backtrade/types";
import BadRequestError from "../errors/web/bad-request-error";

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
     * @throws BadRequestError if user ID is missing
     */
    async getUserById(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        if (!id) {
            throw new BadRequestError("User ID is required");
        }
        const user = await usersService.getUserById(id);
        res.status(200).json(user);
    }

    /**
     * Update user information
     *
     * Users can update their own data. Admins can update any user's data.
     * Supports updating email, role, and is_banned status.
     *
     * Request body can include:
     * - email: Optional new email address (must be unique and valid format)
     * - role: Optional role (USER or ADMIN)
     * - is_banned: Optional banned status
     *
     * @param req - Express request object (req.user guaranteed by authMiddleware)
     * @param res - Express response object
     * @throws BadRequestError if user ID is missing or request body is invalid
     * @throws NotFoundError if user doesn't exist
     * @throws ForbiddenError if user doesn't have access
     * @throws AlreadyExistsError if email is already in use
     */
    async updateUser(req: Request, res: Response): Promise<void> {
        const user = req.user!;
        const { id } = req.params;
        if (!id) {
            throw new BadRequestError("User ID is required");
        }

        const requestData = req.body as UpdateUserRequest;
        const updatedUser = await usersService.updateUser(id, requestData, user);

        // Transform User to PublicUser (exclude sensitive fields)
        const publicUser = PublicUserSchema.parse(updatedUser);

        res.status(200).json(publicUser);
    }

    /**
     * Change user password
     *
     * Users can change their own password by providing their current password.
     * Admins can change any user's password without providing the current password.
     *
     * @param req - Express request object (req.user guaranteed by authMiddleware)
     * @param res - Express response object
     * @throws BadRequestError if user ID is missing
     */
    async changePassword(req: Request, res: Response): Promise<void> {
        const user = req.user!;
        const { id } = req.params;
        if (!id) {
            throw new BadRequestError("User ID is required");
        }
        const { currentPassword, newPassword } =
            req.body as ChangeUserPasswordRequest;

        await usersService.changePassword(
            id,
            currentPassword ?? "",
            newPassword,
            user
        );

        res.status(200).json({ message: "Password changed successfully" });
    }
}

export default new UsersController();
