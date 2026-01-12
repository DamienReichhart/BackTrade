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
import subscriptionsService from "../services/base/subscriptions-service";
import { logger } from "../libs/pino";
import {
    type ChangeUserPasswordRequest,
    type UpdateUserRequest,
    type SearchQueryUser,
    PublicUserSchema,
    SearchQueryUserSchema,
    IdParamsSchema,
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
     * Get all users with search, filtering, sorting, and pagination
     *
     * Admin-only operation. Supports:
     * - Text search (q) - searches email
     * - Role filter (role) - USER or ADMIN
     * - Banned status filter (is_banned) - true or false
     * - Sorting (sort, order)
     * - Pagination (page, limit)
     *
     * @param req - Express request object (req.user guaranteed by authMiddleware)
     * @param res - Express response object
     * @throws ForbiddenError if user is not admin
     * @throws BadRequestError if query parameters are invalid
     */
    async getAllUsers(req: Request, res: Response): Promise<void> {
        const user = req.user!;

        // Parse and validate query parameters
        let query: SearchQueryUser | undefined;
        try {
            // Handle is_banned conversion from string to boolean
            const rawQuery: Record<string, unknown> = { ...req.query };
            if (rawQuery.is_banned !== undefined) {
                if (rawQuery.is_banned === "true") {
                    rawQuery.is_banned = true;
                } else if (rawQuery.is_banned === "false") {
                    rawQuery.is_banned = false;
                }
            }
            query = SearchQueryUserSchema.parse(rawQuery);
        } catch {
            throw new BadRequestError("Invalid query parameters");
        }

        const users = await usersService.getAllUsersWithFilters(user, query);

        // Transform to PublicUser array (exclude sensitive fields)
        const publicUsers = users.map((u) => PublicUserSchema.parse(u));

        res.status(200).json(publicUsers);
    }

    /**
     * Get user by ID
     *
     * @param req - Express request object
     * @param res - Express response object
     * @throws BadRequestError if user ID is missing
     */
    async getUserById(req: Request, res: Response): Promise<void> {
        const { id } = IdParamsSchema.parse(req.params);
        const user = await usersService.getUserById(id);

        // Transform to PublicUser (exclude sensitive fields)
        const publicUser = PublicUserSchema.parse(user);

        res.status(200).json(publicUser);
    }

    /**
     * Get subscriptions for a specific user
     *
     * Users can view their own subscriptions. Admins can view any user's subscriptions.
     *
     * @param req - Express request object (req.user guaranteed by authMiddleware)
     * @param res - Express response object
     * @throws BadRequestError if user ID is missing
     * @throws ForbiddenError if user doesn't have access
     */
    async getUserSubscriptions(req: Request, res: Response): Promise<void> {
        const requestingUser = req.user!;
        const { id } = IdParamsSchema.parse(req.params);

        // Get subscriptions for this user (access check is done in the service)
        const subscriptions = await subscriptionsService.getSubscriptionsByUser(
            id,
            requestingUser
        );

        this.logger.trace(
            { userId: id, count: subscriptions.length },
            "User subscriptions fetched"
        );

        res.status(200).json(subscriptions);
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
        const { id } = IdParamsSchema.parse(req.params);

        const requestData = req.body as UpdateUserRequest;
        const updatedUser = await usersService.updateUser(
            id,
            requestData,
            user
        );

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
        const { id } = IdParamsSchema.parse(req.params);
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

    /**
     * Delete user account
     *
     * Users can delete their own account. Admins can delete any user's account.
     * Sends a confirmation email after successful deletion.
     * This action is permanent and cannot be undone.
     *
     * @param req - Express request object (req.user guaranteed by authMiddleware)
     * @param res - Express response object
     * @throws BadRequestError if user ID is missing
     * @throws NotFoundError if user doesn't exist
     * @throws ForbiddenError if user doesn't have permission to delete this account
     */
    async deleteUserAccount(req: Request, res: Response): Promise<void> {
        const user = req.user!;
        const { id } = IdParamsSchema.parse(req.params);

        this.logger.trace({ id, userId: user.id }, "Deleting user account");

        await usersService.deleteUser(id, user);

        this.logger.info(
            { id, userId: user.id },
            "User account deleted successfully"
        );

        res.status(204).send();
    }
}

export default new UsersController();
