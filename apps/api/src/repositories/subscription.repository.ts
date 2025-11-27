import type { Prisma, Subscription } from "../generated/prisma/client";
import { prisma } from "../libs/prisma";
import type { IBaseRepository } from "./base.repository";

/**
 * Repository for Subscription model operations
 *
 * Provides CRUD operations for managing subscriptions in the database
 */
export class SubscriptionRepository
  implements
    IBaseRepository<
      Subscription,
      Prisma.SubscriptionCreateInput,
      Prisma.SubscriptionUpdateInput,
      Prisma.SubscriptionWhereInput
    >
{
  /**
   * Get all subscriptions
   *
   * @param where - Optional filter conditions
   * @returns Promise resolving to an array of subscriptions
   */
  async getAll(where?: Prisma.SubscriptionWhereInput): Promise<Subscription[]> {
    return prisma.subscription.findMany({
      where,
    });
  }

  /**
   * Get a subscription by ID
   *
   * @param id - The subscription ID
   * @returns Promise resolving to the subscription or null if not found
   */
  async getById(id: number | string): Promise<Subscription | null> {
    return prisma.subscription.findUnique({
      where: { id: Number(id) },
    });
  }

  /**
   * Create a new subscription
   *
   * @param data - The subscription data to create
   * @returns Promise resolving to the created subscription
   */
  async add(data: Prisma.SubscriptionCreateInput): Promise<Subscription> {
    return prisma.subscription.create({
      data,
    });
  }

  /**
   * Update an existing subscription
   *
   * @param id - The subscription ID to update
   * @param data - The subscription data to update
   * @returns Promise resolving to the updated subscription
   */
  async update(
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
   *
   * @param id - The subscription ID to delete
   * @returns Promise resolving to the deleted subscription
   */
  async delete(id: number | string): Promise<Subscription> {
    return prisma.subscription.delete({
      where: { id: Number(id) },
    });
  }
}
