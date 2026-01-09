/**
 * Plans Controller
 *
 * Handles plan-related HTTP requests.
 * Orchestrates plan service operations.
 *
 * Note: Methods that require authentication assume req.user is set by authMiddleware.
 * Routes using those methods must be protected by authMiddleware.
 *
 * Authorization model:
 * - Read operations (getById, getAll): Public (any authenticated user)
 * - Write operations (create, update, delete): Admin only
 */

import type { Request, Response } from "express";
import plansService from "../services/base/plans-service";
import { logger } from "../libs/pino";
import {
    type CreatePlanRequest,
    type UpdatePlanRequest,
    type SearchQuery,
    SearchQuerySchema,
} from "@backtrade/types";
import BadRequestError from "../errors/web/bad-request-error";

/**
 * Plans Controller
 *
 * Handles plan-related HTTP requests.
 * Orchestrates plan service operations.
 */
class PlansController {
    private readonly logger: ReturnType<typeof logger.child>;

    constructor() {
        this.logger = logger.child({
            service: "plans-controller",
        });
    }

    /**
     * Get all plans with optional search and pagination
     *
     * Public operation - any authenticated user can list plans.
     *
     * @param req - Express request object
     * @param res - Express response object
     * @throws BadRequestError if query parameters are invalid
     */
    async getAllPlans(req: Request, res: Response): Promise<void> {
        let query: SearchQuery | undefined;
        try {
            query = SearchQuerySchema.parse(req.query);
        } catch {
            throw new BadRequestError("Invalid query parameters");
        }

        const plans = await plansService.getAllPlans(query);
        res.status(200).json(plans);
    }

    /**
     * Get plan by ID
     *
     * Public operation - any authenticated user can read plans.
     *
     * @param req - Express request object
     * @param res - Express response object
     * @throws BadRequestError if plan ID is missing
     * @throws NotFoundError if plan doesn't exist
     */
    async getPlanById(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        if (!id) {
            throw new BadRequestError("Plan ID is required");
        }

        const plan = await plansService.getPlanById(id);
        res.status(200).json(plan);
    }

    /**
     * Create a new plan
     *
     * Admin-only operation.
     *
     * @param req - Express request object (req.user guaranteed by authMiddleware)
     * @param res - Express response object
     * @throws ForbiddenError if user is not admin
     * @throws BadRequestError if validation fails
     */
    async createPlan(req: Request, res: Response): Promise<void> {
        const user = req.user!;
        const planData = req.body as CreatePlanRequest;

        this.logger.trace(
            {
                userId: user.id,
                code: planData.code,
            },
            "Creating plan"
        );

        const plan = await plansService.createPlan(planData, user);

        this.logger.info(
            { userId: user.id, planId: plan.id },
            "Plan created successfully"
        );

        res.status(201).json(plan);
    }

    /**
     * Update an existing plan
     *
     * Admin-only operation.
     *
     * @param req - Express request object (req.user guaranteed by authMiddleware)
     * @param res - Express response object
     * @throws BadRequestError if plan ID is missing
     * @throws ForbiddenError if user is not admin
     * @throws NotFoundError if plan doesn't exist
     */
    async updatePlan(req: Request, res: Response): Promise<void> {
        const user = req.user!;
        const { id } = req.params;
        if (!id) {
            throw new BadRequestError("Plan ID is required");
        }

        const planData = req.body as UpdatePlanRequest;

        this.logger.trace({ userId: user.id, planId: id }, "Updating plan");

        const plan = await plansService.updatePlan(id, planData, user);

        this.logger.info(
            { userId: user.id, planId: plan.id },
            "Plan updated successfully"
        );

        res.status(200).json(plan);
    }

    /**
     * Delete a plan
     *
     * Admin-only operation.
     *
     * @param req - Express request object (req.user guaranteed by authMiddleware)
     * @param res - Express response object
     * @throws BadRequestError if plan ID is missing
     * @throws ForbiddenError if user is not admin
     * @throws NotFoundError if plan doesn't exist
     */
    async deletePlan(req: Request, res: Response): Promise<void> {
        const user = req.user!;
        const { id } = req.params;
        if (!id) {
            throw new BadRequestError("Plan ID is required");
        }

        this.logger.trace({ userId: user.id, planId: id }, "Deleting plan");

        await plansService.deletePlan(id, user);

        this.logger.info(
            { userId: user.id, planId: id },
            "Plan deleted successfully"
        );

        res.status(204).send();
    }
}

export default new PlansController();
