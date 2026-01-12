/**
 * Subscription Repository
 *
 * Data access layer for Subscription model operations.
 */

import type { Prisma } from "../generated/prisma/client";
import type {
    Subscription,
    SubscriptionWhereInput,
    SubscriptionCreateInput,
    SubscriptionUpdateInput,
} from "@backtrade/types";
import { BasePostgresRepository } from "./base-repository";

/**
 * Repository for Subscription model CRUD operations.
 */
class SubscriptionsRepository extends BasePostgresRepository {
    /**
     * Get all subscriptions matching optional filter conditions.
     *
     * @param where - Optional filter conditions
     * @returns Array of matching subscriptions
     */
    async getAllSubscriptions(
        where?: SubscriptionWhereInput
    ): Promise<Subscription[]> {
        return this.prisma.subscription.findMany({
            where: where as Prisma.SubscriptionWhereInput,
        }) as unknown as Subscription[];
    }

    /**
     * Get a subscription by ID.
     *
     * @param id - Subscription ID as number or string
     * @returns Subscription entity or null if not found
     */
    async getSubscriptionById(
        id: number | string
    ): Promise<Subscription | null> {
        return this.prisma.subscription.findUnique({
            where: { id: this.toNumericId(id) },
        }) as unknown as Subscription | null;
    }

    /**
     * Create a new subscription.
     *
     * @param data - Subscription creation data
     * @returns Created subscription entity
     */
    async createSubscription(
        data: SubscriptionCreateInput
    ): Promise<Subscription> {
        return this.prisma.subscription.create({
            data: data as Prisma.SubscriptionCreateInput,
        }) as unknown as Subscription;
    }

    /**
     * Update an existing subscription.
     *
     * @param id - Subscription ID as number or string
     * @param data - Subscription update data
     * @returns Updated subscription entity
     */
    async updateSubscription(
        id: number | string,
        data: SubscriptionUpdateInput
    ): Promise<Subscription> {
        return this.prisma.subscription.update({
            where: { id: this.toNumericId(id) },
            data: data as Prisma.SubscriptionUpdateInput,
        }) as unknown as Subscription;
    }

    /**
     * Delete a subscription by ID.
     *
     * @param id - Subscription ID as number or string
     * @returns Deleted subscription entity
     */
    async deleteSubscription(id: number | string): Promise<Subscription> {
        return this.prisma.subscription.delete({
            where: { id: this.toNumericId(id) },
        }) as unknown as Subscription;
    }

    /**
     * Check if a user has an active subscription.
     *
     * Active subscriptions are those with status 'active'.
     * Uses an efficient count query for existence check.
     *
     * @param userId - User ID to check
     * @param excludeSubscriptionId - Optional subscription ID to exclude from check (useful for updates)
     * @returns True if user has an active subscription
     */
    async hasActiveSubscription(
        userId: number,
        excludeSubscriptionId?: number
    ): Promise<boolean> {
        const count = await this.prisma.subscription.count({
            where: {
                user_id: userId,
                status: "active",
                ...(excludeSubscriptionId !== undefined && {
                    id: { not: excludeSubscriptionId },
                }),
            },
        });
        return count > 0;
    }

    /**
     * Get the active subscription for a user.
     *
     * Active subscriptions are those with status 'active'.
     * Returns the first active subscription found (there should be at most one).
     *
     * @param userId - User ID to get subscription for
     * @returns Active subscription or null if none exists
     */
    async getActiveSubscriptionByUserId(
        userId: number
    ): Promise<Subscription | null> {
        return this.prisma.subscription.findFirst({
            where: {
                user_id: userId,
                status: "active",
            },
        }) as unknown as Subscription | null;
    }

    /**
     * Get a subscription by Stripe subscription ID.
     *
     * Used for webhook processing to find subscriptions by their Stripe ID.
     *
     * @param stripeSubscriptionId - Stripe subscription ID
     * @returns Subscription entity or null if not found
     */
    async getByStripeSubscriptionId(
        stripeSubscriptionId: string
    ): Promise<Subscription | null> {
        return this.prisma.subscription.findFirst({
            where: {
                stripe_subscription_id: stripeSubscriptionId,
            },
        }) as unknown as Subscription | null;
    }
}

const subscriptionsRepo = new SubscriptionsRepository();

export default subscriptionsRepo;
