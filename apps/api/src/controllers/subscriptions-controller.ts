/**
 * Subscriptions Controller
 *
 * Handles subscription-related HTTP requests.
 * Orchestrates subscription service operations.
 *
 * Note: Methods that require authentication assume req.user is set by authMiddleware.
 * Routes using those methods must be protected by authMiddleware.
 *
 * Authorization model:
 * - Read own subscriptions: Any authenticated user
 * - Read all subscriptions: Admin only
 * - Write operations (create, update, delete): Admin only
 */

import type { Request, Response } from "express";
import subscriptionsService from "../services/base/subscriptions-service";
import { logger } from "../libs/pino";
import {
    type CreateSubscriptionRequest,
    type UpdateSubscriptionRequest,
    type DateRangeQuery,
    DateRangeQuerySchema,
    IdParamsSchema,
} from "@backtrade/types";
import BadRequestError from "../errors/web/bad-request-error";

/**
 * Subscriptions Controller
 *
 * Handles subscription-related HTTP requests.
 * Orchestrates subscription service operations.
 */
class SubscriptionsController {
    private readonly logger: ReturnType<typeof logger.child>;

    constructor() {
        this.logger = logger.child({
            service: "subscriptions-controller",
        });
    }

    /**
     * Get all subscriptions with optional filtering and pagination
     *
     * Regular users see their own subscriptions only.
     * Admins see all subscriptions.
     *
     * @param req - Express request object (req.user guaranteed by authMiddleware)
     * @param res - Express response object
     * @throws BadRequestError if query parameters are invalid
     */
    async getAllSubscriptions(req: Request, res: Response): Promise<void> {
        const user = req.user!;

        let query: DateRangeQuery | undefined;
        try {
            query = DateRangeQuerySchema.parse(req.query);
        } catch {
            throw new BadRequestError("Invalid query parameters");
        }

        const subscriptions = await subscriptionsService.getAllSubscriptions(
            user,
            query
        );
        res.status(200).json(subscriptions);
    }

    /**
     * Get subscription by ID
     *
     * Users can view their own subscriptions.
     * Admins can view any subscription.
     *
     * @param req - Express request object (req.user guaranteed by authMiddleware)
     * @param res - Express response object
     * @throws BadRequestError if subscription ID is missing
     * @throws NotFoundError if subscription doesn't exist
     * @throws ForbiddenError if user doesn't have access
     */
    async getSubscriptionById(req: Request, res: Response): Promise<void> {
        const user = req.user!;
        const { id } = IdParamsSchema.parse(req.params);

        const subscription = await subscriptionsService.getSubscriptionById(
            id,
            user
        );
        res.status(200).json(subscription);
    }

    /**
     * Create a new subscription
     *
     * Admin-only operation.
     *
     * @param req - Express request object (req.user guaranteed by authMiddleware)
     * @param res - Express response object
     * @throws ForbiddenError if user is not admin
     * @throws BadRequestError if validation fails
     * @throws NotFoundError if user or plan doesn't exist
     */
    async createSubscription(req: Request, res: Response): Promise<void> {
        const user = req.user!;
        const subscriptionData = req.body as CreateSubscriptionRequest;

        this.logger.trace(
            {
                adminId: user.id,
                userId: subscriptionData.user_id,
                planId: subscriptionData.plan_id,
            },
            "Creating subscription"
        );

        const subscription = await subscriptionsService.createSubscription(
            subscriptionData,
            user
        );

        this.logger.info(
            { adminId: user.id, subscriptionId: subscription.id },
            "Subscription created successfully"
        );

        res.status(201).json(subscription);
    }

    /**
     * Update an existing subscription
     *
     * Admin-only operation.
     *
     * @param req - Express request object (req.user guaranteed by authMiddleware)
     * @param res - Express response object
     * @throws BadRequestError if subscription ID is missing
     * @throws ForbiddenError if user is not admin
     * @throws NotFoundError if subscription doesn't exist
     */
    async updateSubscription(req: Request, res: Response): Promise<void> {
        const user = req.user!;
        const { id } = IdParamsSchema.parse(req.params);

        const subscriptionData = req.body as UpdateSubscriptionRequest;

        this.logger.trace(
            { adminId: user.id, subscriptionId: id },
            "Updating subscription"
        );

        const subscription = await subscriptionsService.updateSubscription(
            id,
            subscriptionData,
            user
        );

        this.logger.info(
            { adminId: user.id, subscriptionId: subscription.id },
            "Subscription updated successfully"
        );

        res.status(200).json(subscription);
    }

    /**
     * Delete a subscription
     *
     * Admin-only operation.
     *
     * @param req - Express request object (req.user guaranteed by authMiddleware)
     * @param res - Express response object
     * @throws BadRequestError if subscription ID is missing
     * @throws ForbiddenError if user is not admin
     * @throws NotFoundError if subscription doesn't exist
     */
    async deleteSubscription(req: Request, res: Response): Promise<void> {
        const user = req.user!;
        const { id } = IdParamsSchema.parse(req.params);

        this.logger.trace(
            { adminId: user.id, subscriptionId: id },
            "Deleting subscription"
        );

        await subscriptionsService.deleteSubscription(id, user);

        this.logger.info(
            { adminId: user.id, subscriptionId: id },
            "Subscription deleted successfully"
        );

        res.status(204).send();
    }
}

export default new SubscriptionsController();
