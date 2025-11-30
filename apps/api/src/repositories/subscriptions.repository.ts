/**
 * Subscription Repository
 *
 * Data access layer for Subscription model operations.
 */

import type { Prisma, Subscription } from "../generated/prisma/client";
import { prisma } from "../libs/prisma";

/**
 * Get all subscriptions matching optional filter conditions
 */
async function getAllSubscriptions(
  where?: Prisma.SubscriptionWhereInput,
): Promise<Subscription[]> {
  return prisma.subscription.findMany({ where });
}

/**
 * Get a subscription by ID
 */
async function getSubscriptionById(
  id: number | string,
): Promise<Subscription | null> {
  return prisma.subscription.findUnique({
    where: { id: Number(id) },
  });
}

/**
 * Create a new subscription
 */
async function createSubscription(
  data: Prisma.SubscriptionCreateInput,
): Promise<Subscription> {
  return prisma.subscription.create({ data });
}

/**
 * Update an existing subscription
 */
async function updateSubscription(
  id: number | string,
  data: Prisma.SubscriptionUpdateInput,
): Promise<Subscription> {
  return prisma.subscription.update({
    where: { id: Number(id) },
    data,
  });
}

/**
 * Delete a subscription by ID
 */
async function deleteSubscription(id: number | string): Promise<Subscription> {
  return prisma.subscription.delete({
    where: { id: Number(id) },
  });
}

export default {
  getAllSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  deleteSubscription,
};
