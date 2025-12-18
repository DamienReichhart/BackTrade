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
}

const subscriptionsRepo = new SubscriptionsRepository();

export default subscriptionsRepo;
