/**
 * Subscriptions Service
 *
 * Handles business logic for subscription operations including CRUD, validation, and authorization.
 * Subscriptions link users to their subscription plans.
 *
 * Authorization model:
 * - Read own subscriptions: Any authenticated user
 * - Read all subscriptions: Admin only
 * - Write operations (create, update, delete): Admin only
 */

import { subscriptionsRepo, usersRepo, plansRepo } from "@backtrade/data";
import {
    SUBSCRIPTION_STATUS_VALUES,
    type Subscription,
    type SubscriptionWhereInput,
    type SubscriptionCreateInput,
    type SubscriptionUpdateInput,
    type User,
    type DateRangeQuery,
    type SubscriptionStatus,
} from "@backtrade/types";
import NotFoundError from "../../errors/web/not-found-error";
import BadRequestError from "../../errors/web/bad-request-error";
import ForbiddenError from "../../errors/web/forbidden-error";
import AlreadyExistsError from "../../errors/web/already-exists-error";
import { BaseService } from "./base-service";
import { buildPagination } from "../../utils";
import { PAGINATION_CONSTANTS } from "../../config/trading-constants";

/**
 * Valid subscription statuses
 * Uses enum values from @backtrade/types for consistency
 */
const VALID_STATUSES = SUBSCRIPTION_STATUS_VALUES;

/**
 * Statuses that represent an active subscription
 * A user can only have one subscription with these statuses at a time
 */
const ACTIVE_STATUSES: readonly SubscriptionStatus[] = [
    "active",
] as const satisfies readonly SubscriptionStatus[];

/**
 * Subscriptions Service
 *
 * Handles business logic for subscription operations.
 */
class SubscriptionsService extends BaseService {
    constructor() {
        super("subscriptions-service");
    }

    // ============================================================================
    // VALIDATION METHODS
    // ============================================================================

    /**
     * Validate user_id exists
     *
     * @param userId - User ID to validate
     * @throws BadRequestError if user_id is missing
     * @throws NotFoundError if user doesn't exist
     */
    private async validateUserId(
        userId: number | undefined | null
    ): Promise<void> {
        if (!userId) {
            throw new BadRequestError("User ID is required");
        }

        const user = await usersRepo.getUserById(userId);
        if (!user) {
            this.logger.debug(
                { userId },
                "User not found when creating subscription"
            );
            throw new NotFoundError(`User with ID ${userId} not found`);
        }
    }

    /**
     * Validate plan_id exists
     *
     * @param planId - Plan ID to validate
     * @throws BadRequestError if plan_id is missing
     * @throws NotFoundError if plan doesn't exist
     */
    private async validatePlanId(
        planId: number | undefined | null
    ): Promise<void> {
        if (!planId) {
            throw new BadRequestError("Plan ID is required");
        }

        const plan = await plansRepo.getPlanById(planId);
        if (!plan) {
            this.logger.debug(
                { planId },
                "Plan not found when creating subscription"
            );
            throw new NotFoundError(`Plan with ID ${planId} not found`);
        }
    }

    /**
     * Validate Stripe subscription ID is provided
     *
     * @param stripeSubscriptionId - Stripe subscription ID to validate
     * @throws BadRequestError if missing or empty
     */
    private validateStripeSubscriptionId(
        stripeSubscriptionId: string | undefined | null
    ): void {
        if (!stripeSubscriptionId || stripeSubscriptionId.trim().length === 0) {
            throw new BadRequestError("Stripe subscription ID is required");
        }
    }

    /**
     * Validate period dates (start < end)
     *
     * @param start - Period start date
     * @param end - Period end date
     * @throws BadRequestError if dates are invalid
     */
    private validatePeriodDates(
        start: string | undefined | null,
        end: string | undefined | null
    ): void {
        if (!start) {
            throw new BadRequestError("Current period start is required");
        }
        if (!end) {
            throw new BadRequestError("Current period end is required");
        }

        const startDate = new Date(start);
        const endDate = new Date(end);

        if (isNaN(startDate.getTime())) {
            throw new BadRequestError("Invalid current period start date");
        }
        if (isNaN(endDate.getTime())) {
            throw new BadRequestError("Invalid current period end date");
        }
        if (startDate >= endDate) {
            throw new BadRequestError(
                "Current period start must be before current period end"
            );
        }
    }

    /**
     * Validate status is valid if provided
     *
     * @param status - Status to validate
     * @throws BadRequestError if status is invalid
     */
    private validateStatus(status: string | undefined | null): void {
        if (status !== undefined && status !== null) {
            if (!VALID_STATUSES.includes(status as SubscriptionStatus)) {
                throw new BadRequestError(
                    `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`
                );
            }
        }
    }

    /**
     * Check if a status is considered "active"
     *
     * @param status - Status to check
     * @returns True if the status represents an active subscription
     */
    private isActiveStatus(status: string | undefined | null): boolean {
        return (
            status !== undefined &&
            status !== null &&
            ACTIVE_STATUSES.includes(status as SubscriptionStatus)
        );
    }

    /**
     * Validate that user does not already have an active subscription
     *
     * Each user can only have one active subscription (status: 'active') at a time.
     * This validation prevents creating duplicate active subscriptions.
     *
     * @param userId - User ID to check
     * @param excludeSubscriptionId - Optional subscription ID to exclude (used during updates to allow same subscription changes)
     * @throws AlreadyExistsError if user already has an active subscription
     */
    private async validateNoActiveSubscription(
        userId: number,
        excludeSubscriptionId?: number
    ): Promise<void> {
        const hasActive = await subscriptionsRepo.hasActiveSubscription(
            userId,
            excludeSubscriptionId
        );

        if (hasActive) {
            this.logger.debug(
                { userId, excludeSubscriptionId },
                "User already has an active subscription"
            );
            throw new AlreadyExistsError(
                "User already has an active subscription. Please cancel the existing subscription before creating a new one."
            );
        }
    }

    /**
     * Validate all business rules for subscription creation
     *
     * @param subscription - Subscription creation data
     * @throws BadRequestError if validation fails
     * @throws NotFoundError if user or plan doesn't exist
     */
    private async validateSubscriptionCreation(
        subscription: SubscriptionCreateInput
    ): Promise<void> {
        await this.validateUserId(subscription.user_id);
        await this.validatePlanId(subscription.plan_id);
        this.validateStripeSubscriptionId(subscription.stripe_subscription_id);
        this.validatePeriodDates(
            subscription.current_period_start,
            subscription.current_period_end
        );
        this.validateStatus(subscription.status);
    }

    /**
     * Validate all business rules for subscription update
     *
     * @param subscription - Subscription update data
     * @throws BadRequestError if validation fails
     */
    private validateSubscriptionUpdate(
        subscription: SubscriptionUpdateInput
    ): void {
        // Validate status if provided
        this.validateStatus(subscription.status);
    }

    // ============================================================================
    // AUTHORIZATION METHODS
    // ============================================================================

    /**
     * Ensure user has access to view a subscription
     *
     * Users can only view their own subscriptions. Admins can view any subscription.
     *
     * @param subscription - Subscription entity
     * @param requestingUser - User entity making the request
     * @throws ForbiddenError if user doesn't have access
     */
    private ensureSubscriptionAccess(
        subscription: Subscription,
        requestingUser: User
    ): void {
        if (
            subscription.user_id !== requestingUser.id &&
            requestingUser.role !== "ADMIN"
        ) {
            this.logger.debug(
                {
                    subscriptionId: subscription.id,
                    subscriptionUserId: subscription.user_id,
                    requestingUserId: requestingUser.id,
                    requestingUserRole: requestingUser.role,
                },
                "User attempted to access another user's subscription"
            );
            throw new ForbiddenError(
                "You don't have permission to access this subscription"
            );
        }
    }

    /**
     * Ensure user has admin access for write operations
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
                "Non-admin user attempted subscription write operation"
            );
            throw new ForbiddenError(
                "Only administrators can perform this operation on subscriptions"
            );
        }
    }

    // ============================================================================
    // QUERY BUILDING METHODS
    // ============================================================================

    /**
     * Build date range conditions for subscription queries
     *
     * @param tsGte - Greater than or equal date filter
     * @param tsLte - Less than or equal date filter
     * @returns Where clause with date conditions or undefined
     */
    private buildDateRangeConditions(
        tsGte?: string,
        tsLte?: string
    ): SubscriptionWhereInput | undefined {
        if (!tsGte && !tsLte) {
            return undefined;
        }

        const conditions: SubscriptionWhereInput = {};

        if (tsGte) {
            conditions.current_period_start = {
                gte: tsGte,
            };
        }

        if (tsLte) {
            conditions.current_period_end = {
                lte: tsLte,
            };
        }

        return conditions;
    }

    // ============================================================================
    // PUBLIC METHODS
    // ============================================================================

    /**
     * Get a subscription by ID
     *
     * @param id - Subscription ID
     * @param requestingUser - User entity making the request
     * @returns Subscription entity
     * @throws NotFoundError if subscription doesn't exist
     * @throws ForbiddenError if user doesn't have access
     */
    async getSubscriptionById(
        id: string | number,
        requestingUser: User
    ): Promise<Subscription> {
        const numericId = typeof id === "string" ? Number(id) : id;

        const subscription =
            await subscriptionsRepo.getSubscriptionById(numericId);
        if (!subscription) {
            this.logger.debug(
                { id: numericId },
                "Subscription not found, throwing not found error"
            );
            throw new NotFoundError("Subscription not found");
        }

        // Verify access
        this.ensureSubscriptionAccess(subscription, requestingUser);

        return subscription;
    }

    /**
     * Get all subscriptions with optional filtering and pagination
     *
     * Regular users can only see their own subscriptions.
     * Admins can see all subscriptions.
     *
     * @param requestingUser - User entity making the request
     * @param query - Optional query parameters with pagination and date range
     * @returns Array of subscription entities
     */
    async getAllSubscriptions(
        requestingUser: User,
        query?: DateRangeQuery
    ): Promise<Subscription[]> {
        const {
            ts_gte,
            ts_lte,
            page = PAGINATION_CONSTANTS.DEFAULT_PAGE,
            limit = PAGINATION_CONSTANTS.DEFAULT_PAGE_LIMIT,
        } = query ?? {};

        // Build base where condition
        let where: SubscriptionWhereInput | undefined;

        // Non-admins can only see their own subscriptions
        if (requestingUser.role !== "ADMIN") {
            where = { user_id: { equals: requestingUser.id } };
        }

        // Add date range conditions
        const dateConditions = this.buildDateRangeConditions(ts_gte, ts_lte);
        if (dateConditions) {
            where = where ? { AND: [where, dateConditions] } : dateConditions;
        }

        // Build pagination using shared utility
        const { skip, take } = buildPagination(page, limit);

        // Get all subscriptions matching criteria
        const subscriptions =
            await subscriptionsRepo.getAllSubscriptions(where);

        // Apply pagination manually (until repo is updated to support it)
        const paginatedSubscriptions = subscriptions.slice(skip, skip + take);

        this.logger.trace(
            { count: paginatedSubscriptions.length },
            "Subscriptions fetched"
        );
        return paginatedSubscriptions;
    }

    /**
     * Get subscriptions for a specific user
     *
     * @param userId - User ID
     * @param requestingUser - User entity making the request
     * @param query - Optional query parameters
     * @returns Array of subscription entities
     * @throws ForbiddenError if user doesn't have access
     */
    async getSubscriptionsByUser(
        userId: string | number,
        requestingUser: User,
        query?: DateRangeQuery
    ): Promise<Subscription[]> {
        const numericUserId =
            typeof userId === "string" ? Number(userId) : userId;

        // Check access - users can only see their own, admins can see any
        if (
            numericUserId !== requestingUser.id &&
            requestingUser.role !== "ADMIN"
        ) {
            throw new ForbiddenError(
                "You don't have permission to view this user's subscriptions"
            );
        }

        const { ts_gte, ts_lte } = query ?? {};

        // Build where condition
        let where: SubscriptionWhereInput = {
            user_id: { equals: numericUserId },
        };

        // Add date range conditions
        const dateConditions = this.buildDateRangeConditions(ts_gte, ts_lte);
        if (dateConditions) {
            where = { AND: [where, dateConditions] };
        }

        const subscriptions =
            await subscriptionsRepo.getAllSubscriptions(where);

        this.logger.trace(
            { userId: numericUserId, count: subscriptions.length },
            "User subscriptions fetched"
        );
        return subscriptions;
    }

    /**
     * Create a new subscription
     *
     * Admin-only operation.
     * Enforces single active subscription per user constraint.
     *
     * @param subscription - Subscription creation data
     * @param user - User entity making the request (for authorization)
     * @returns Created subscription entity
     * @throws ForbiddenError if user is not admin
     * @throws BadRequestError if validation fails
     * @throws NotFoundError if user or plan doesn't exist
     * @throws AlreadyExistsError if user already has an active subscription
     */
    async createSubscription(
        subscription: SubscriptionCreateInput,
        user: User
    ): Promise<Subscription> {
        // Check admin access
        this.ensureAdminAccess(user, "create");

        // Validate business rules
        await this.validateSubscriptionCreation(subscription);

        // Set default status if not provided
        const subscriptionData: SubscriptionCreateInput = {
            ...subscription,
            status: subscription.status ?? "active",
        };

        // If creating an active subscription, verify user doesn't already have one
        if (this.isActiveStatus(subscriptionData.status)) {
            await this.validateNoActiveSubscription(subscription.user_id!);
        }

        this.logger.trace(
            {
                userId: subscription.user_id,
                planId: subscription.plan_id,
                adminId: user.id,
            },
            "Creating subscription"
        );

        const created =
            await subscriptionsRepo.createSubscription(subscriptionData);
        this.logger.debug({ id: created.id }, "Subscription created");

        return created;
    }

    /**
     * Update an existing subscription
     *
     * Admin-only operation.
     * Enforces single active subscription per user constraint when changing to active status.
     *
     * @param id - Subscription ID
     * @param subscription - Subscription update data
     * @param user - User entity making the request (for authorization)
     * @returns Updated subscription entity
     * @throws NotFoundError if subscription doesn't exist
     * @throws ForbiddenError if user is not admin
     * @throws BadRequestError if validation fails
     * @throws AlreadyExistsError if changing to active status and user already has another active subscription
     */
    async updateSubscription(
        id: string | number,
        subscription: SubscriptionUpdateInput,
        user: User
    ): Promise<Subscription> {
        const numericId = typeof id === "string" ? Number(id) : id;

        // Check admin access
        this.ensureAdminAccess(user, "update");

        // Verify subscription exists
        const existing = await subscriptionsRepo.getSubscriptionById(numericId);
        if (!existing) {
            this.logger.debug(
                { id: numericId },
                "Subscription not found, throwing not found error"
            );
            throw new NotFoundError("Subscription not found");
        }

        // Validate business rules
        this.validateSubscriptionUpdate(subscription);

        // If changing to an active status (and not already active), verify user doesn't have another active subscription
        const isChangingToActive =
            this.isActiveStatus(subscription.status) &&
            !this.isActiveStatus(existing.status);

        if (isChangingToActive) {
            // Exclude current subscription from the check since we're updating it
            await this.validateNoActiveSubscription(
                existing.user_id,
                numericId
            );
        }

        const updated = await subscriptionsRepo.updateSubscription(
            numericId,
            subscription
        );
        this.logger.debug({ id: updated.id }, "Subscription updated");

        return updated;
    }

    /**
     * Delete a subscription
     *
     * Admin-only operation.
     *
     * @param id - Subscription ID
     * @param user - User entity making the request (for authorization)
     * @throws NotFoundError if subscription doesn't exist
     * @throws ForbiddenError if user is not admin
     */
    async deleteSubscription(id: string | number, user: User): Promise<void> {
        const numericId = typeof id === "string" ? Number(id) : id;

        // Check admin access
        this.ensureAdminAccess(user, "delete");

        // Verify subscription exists
        const existing = await subscriptionsRepo.getSubscriptionById(numericId);
        if (!existing) {
            this.logger.debug(
                { id: numericId },
                "Subscription not found, throwing not found error"
            );
            throw new NotFoundError("Subscription not found");
        }

        await subscriptionsRepo.deleteSubscription(numericId);
        this.logger.debug({ id: numericId }, "Subscription deleted");
    }
}

export default new SubscriptionsService();
