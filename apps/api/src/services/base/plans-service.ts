/**
 * Plans Service
 *
 * Handles business logic for subscription plan operations including CRUD, validation, and authorization.
 * Plans represent subscription tiers available in the system.
 *
 * Authorization model:
 * - Read operations (getById, getAll): Public (any authenticated user)
 * - Write operations (create, update, delete): Admin only
 */

import { plansRepo } from "@backtrade/data";
import type {
    Plan,
    PlanCreateInput,
    PlanUpdateInput,
    User,
    SearchQuery,
} from "@backtrade/types";
import NotFoundError from "../../errors/web/not-found-error";
import BadRequestError from "../../errors/web/bad-request-error";
import ForbiddenError from "../../errors/web/forbidden-error";
import { BaseService } from "./base-service";
import { buildPagination } from "../../utils";
import { PAGINATION_CONSTANTS } from "../../config/trading-constants";

/**
 * Valid currency codes (ISO 4217 format)
 */
const VALID_CURRENCY_LENGTH = 3;

/**
 * Plans Service
 *
 * Handles business logic for plan operations.
 */
class PlansService extends BaseService {
    constructor() {
        super("plans-service");
    }

    // ============================================================================
    // VALIDATION METHODS
    // ============================================================================

    /**
     * Validate plan code is provided and not empty
     *
     * @param code - Plan code to validate
     * @throws BadRequestError if code is missing or empty
     */
    private validateCode(code: string | undefined | null): void {
        if (!code || code.trim().length === 0) {
            throw new BadRequestError("Plan code is required");
        }
    }

    /**
     * Validate currency is a valid 3-letter ISO code
     *
     * @param currency - Currency code to validate
     * @throws BadRequestError if currency is invalid
     */
    private validateCurrency(currency: string | undefined | null): void {
        if (!currency) {
            throw new BadRequestError("Currency is required");
        }
        if (currency.length !== VALID_CURRENCY_LENGTH) {
            throw new BadRequestError(
                `Currency must be a ${VALID_CURRENCY_LENGTH}-letter ISO code`
            );
        }
    }

    /**
     * Validate Stripe product ID is provided
     *
     * @param stripeProductId - Stripe product ID to validate
     * @throws BadRequestError if missing
     */
    private validateStripeProductId(
        stripeProductId: string | undefined | null
    ): void {
        if (!stripeProductId || stripeProductId.trim().length === 0) {
            throw new BadRequestError("Stripe product ID is required");
        }
    }

    /**
     * Validate Stripe price ID is provided
     *
     * @param stripePriceId - Stripe price ID to validate
     * @throws BadRequestError if missing
     */
    private validateStripePriceId(
        stripePriceId: string | undefined | null
    ): void {
        if (!stripePriceId || stripePriceId.trim().length === 0) {
            throw new BadRequestError("Stripe price ID is required");
        }
    }

    /**
     * Validate price is non-negative
     *
     * @param price - Price to validate
     * @throws BadRequestError if price is negative
     */
    private validatePrice(price: number | undefined | null): void {
        if (price === undefined || price === null) {
            throw new BadRequestError("Price is required");
        }
        if (price < 0) {
            throw new BadRequestError("Price must be non-negative");
        }
    }

    /**
     * Validate all business rules for plan creation
     *
     * @param plan - Plan creation data
     * @throws BadRequestError if validation fails
     */
    private validatePlanCreation(plan: PlanCreateInput): void {
        this.validateCode(plan.code);
        this.validateCurrency(plan.currency);
        this.validateStripeProductId(plan.stripe_product_id);
        this.validateStripePriceId(plan.stripe_price_id);
        this.validatePrice(plan.price);
    }

    /**
     * Validate all business rules for plan update
     *
     * @param plan - Plan update data
     * @throws BadRequestError if validation fails
     */
    private validatePlanUpdate(plan: PlanUpdateInput): void {
        // Validate code if provided
        if (plan.code !== undefined) {
            this.validateCode(plan.code);
        }

        // Validate currency if provided
        if (plan.currency !== undefined) {
            this.validateCurrency(plan.currency);
        }

        // Validate Stripe product ID if provided
        if (plan.stripe_product_id !== undefined) {
            this.validateStripeProductId(plan.stripe_product_id);
        }

        // Validate Stripe price ID if provided
        if (plan.stripe_price_id !== undefined) {
            this.validateStripePriceId(plan.stripe_price_id);
        }

        // Validate price if provided
        if (plan.price !== undefined) {
            this.validatePrice(plan.price);
        }
    }

    // ============================================================================
    // AUTHORIZATION METHODS
    // ============================================================================

    /**
     * Ensure user has admin access for write operations
     *
     * Plans are public for reading but require admin access for modifications.
     *
     * @param user - User entity making the request
     * @param operation - Operation being performed (for logging)
     * @throws ForbiddenError if user is not admin
     */
    private ensureAdminAccess(user: User, operation: string): void {
        if (user.role !== "ADMIN") {
            this.logger.debug(
                {
                    userId: user.id,
                    userRole: user.role,
                    operation,
                },
                "Non-admin user attempted plan write operation"
            );
            throw new ForbiddenError(
                "Only administrators can perform this operation on plans"
            );
        }
    }

    // ============================================================================
    // PUBLIC METHODS
    // ============================================================================

    /**
     * Get a plan by ID
     *
     * Public operation - any authenticated user can read plans.
     *
     * @param id - Plan ID
     * @returns Plan entity
     * @throws NotFoundError if plan doesn't exist
     */
    async getPlanById(id: string | number): Promise<Plan> {
        const numericId = typeof id === "string" ? Number(id) : id;

        const plan = await plansRepo.getPlanById(numericId);
        if (!plan) {
            this.logger.debug(
                { id: numericId },
                "Plan not found, throwing not found error"
            );
            throw new NotFoundError("Plan not found");
        }

        return plan;
    }

    /**
     * Get all plans with optional search and pagination
     *
     * Public operation - any authenticated user can list plans.
     *
     * @param query - Optional search query with pagination and sorting
     * @returns Array of plan entities
     */
    async getAllPlans(query?: SearchQuery): Promise<Plan[]> {
        const {
            q,
            page = PAGINATION_CONSTANTS.DEFAULT_PAGE,
            limit = PAGINATION_CONSTANTS.DEFAULT_PAGE_LIMIT,
        } = query ?? {};

        // Build where clause for search (searching by code)
        const where = q
            ? {
                  code: {
                      contains: q,
                      mode: "insensitive" as const,
                  },
              }
            : undefined;

        // Build pagination using shared utility
        const { skip, take } = buildPagination(page, limit);

        // Note: plansRepo.getAllPlans currently only accepts where
        // We'll pass all params but the repo will only use where for now
        const plans = await plansRepo.getAllPlans(where);

        // Apply pagination manually if repo doesn't support it
        // This is a temporary solution until the repo is updated
        const paginatedPlans = plans.slice(skip, skip + take);

        this.logger.trace({ count: paginatedPlans.length }, "Plans fetched");
        return paginatedPlans;
    }

    /**
     * Create a new plan
     *
     * Admin-only operation.
     *
     * @param plan - Plan creation data
     * @param user - User entity making the request (for authorization)
     * @returns Created plan entity
     * @throws ForbiddenError if user is not admin
     * @throws BadRequestError if validation fails
     */
    async createPlan(plan: PlanCreateInput, user: User): Promise<Plan> {
        // Check admin access
        this.ensureAdminAccess(user, "create");

        // Validate business rules
        this.validatePlanCreation(plan);

        this.logger.trace(
            {
                code: plan.code,
                userId: user.id,
            },
            "Creating plan"
        );

        const created = await plansRepo.createPlan(plan);
        this.logger.debug({ id: created.id }, "Plan created");

        return created;
    }

    /**
     * Update an existing plan
     *
     * Admin-only operation.
     *
     * @param id - Plan ID
     * @param plan - Plan update data
     * @param user - User entity making the request (for authorization)
     * @returns Updated plan entity
     * @throws NotFoundError if plan doesn't exist
     * @throws ForbiddenError if user is not admin
     * @throws BadRequestError if validation fails
     */
    async updatePlan(
        id: string | number,
        plan: PlanUpdateInput,
        user: User
    ): Promise<Plan> {
        const numericId = typeof id === "string" ? Number(id) : id;

        // Check admin access
        this.ensureAdminAccess(user, "update");

        // Verify plan exists
        const existing = await plansRepo.getPlanById(numericId);
        if (!existing) {
            this.logger.debug(
                { id: numericId },
                "Plan not found, throwing not found error"
            );
            throw new NotFoundError("Plan not found");
        }

        // Validate business rules
        this.validatePlanUpdate(plan);

        const updated = await plansRepo.updatePlan(numericId, plan);
        this.logger.debug({ id: updated.id }, "Plan updated");

        return updated;
    }

    /**
     * Delete a plan
     *
     * Admin-only operation.
     *
     * @param id - Plan ID
     * @param user - User entity making the request (for authorization)
     * @throws NotFoundError if plan doesn't exist
     * @throws ForbiddenError if user is not admin
     */
    async deletePlan(id: string | number, user: User): Promise<void> {
        const numericId = typeof id === "string" ? Number(id) : id;

        // Check admin access
        this.ensureAdminAccess(user, "delete");

        // Verify plan exists
        const existing = await plansRepo.getPlanById(numericId);
        if (!existing) {
            this.logger.debug(
                { id: numericId },
                "Plan not found, throwing not found error"
            );
            throw new NotFoundError("Plan not found");
        }

        await plansRepo.deletePlan(numericId);
        this.logger.debug({ id: numericId }, "Plan deleted");
    }
}

export default new PlansService();
