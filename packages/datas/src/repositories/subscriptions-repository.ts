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
import { prisma } from "../libs/prisma";

/**
 * Get all subscriptions matching optional filter conditions
 */
async function getAllSubscriptions(
    where?: SubscriptionWhereInput
): Promise<Subscription[]> {
    return prisma.subscription.findMany({
        where: where as Prisma.SubscriptionWhereInput,
    }) as unknown as Subscription[];
}

/**
 * Get a subscription by ID
 */
async function getSubscriptionById(
    id: number | string
): Promise<Subscription | null> {
    return prisma.subscription.findUnique({
        where: { id: Number(id) },
    }) as unknown as Subscription | null;
}

/**
 * Create a new subscription
 */
async function createSubscription(
    data: SubscriptionCreateInput
): Promise<Subscription> {
    return prisma.subscription.create({
        data: data as Prisma.SubscriptionCreateInput,
    }) as unknown as Subscription;
}

/**
 * Update an existing subscription
 */
async function updateSubscription(
    id: number | string,
    data: SubscriptionUpdateInput
): Promise<Subscription> {
    return prisma.subscription.update({
        where: { id: Number(id) },
        data: data as Prisma.SubscriptionUpdateInput,
    }) as unknown as Subscription;
}

/**
 * Delete a subscription by ID
 */
async function deleteSubscription(id: number | string): Promise<Subscription> {
    return prisma.subscription.delete({
        where: { id: Number(id) },
    }) as unknown as Subscription;
}

export default {
    getAllSubscriptions,
    getSubscriptionById,
    createSubscription,
    updateSubscription,
    deleteSubscription,
};
