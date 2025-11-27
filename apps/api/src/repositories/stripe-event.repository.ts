import type { Prisma, StripeEvent } from "../generated/prisma/client";
import { prisma } from "../libs/prisma";
import type { IBaseRepository } from "./base.repository";

/**
 * Repository for StripeEvent model operations
 *
 * Provides CRUD operations for managing Stripe events in the database
 */
export class StripeEventRepository
  implements
    IBaseRepository<
      StripeEvent,
      Prisma.StripeEventCreateInput,
      Prisma.StripeEventUpdateInput,
      Prisma.StripeEventWhereInput
    >
{
  /**
   * Get all Stripe events
   *
   * @param where - Optional filter conditions
   * @returns Promise resolving to an array of Stripe events
   */
  async getAll(where?: Prisma.StripeEventWhereInput): Promise<StripeEvent[]> {
    return prisma.stripeEvent.findMany({
      where,
    });
  }

  /**
   * Get a Stripe event by ID
   *
   * @param id - The Stripe event ID
   * @returns Promise resolving to the Stripe event or null if not found
   */
  async getById(id: number | string): Promise<StripeEvent | null> {
    return prisma.stripeEvent.findUnique({
      where: { id: Number(id) },
    });
  }

  /**
   * Create a new Stripe event
   *
   * @param data - The Stripe event data to create
   * @returns Promise resolving to the created Stripe event
   */
  async add(data: Prisma.StripeEventCreateInput): Promise<StripeEvent> {
    return prisma.stripeEvent.create({
      data,
    });
  }

  /**
   * Update an existing Stripe event
   *
   * @param id - The Stripe event ID to update
   * @param data - The Stripe event data to update
   * @returns Promise resolving to the updated Stripe event
   */
  async update(
    id: number | string,
    data: Prisma.StripeEventUpdateInput,
  ): Promise<StripeEvent> {
    return prisma.stripeEvent.update({
      where: { id: Number(id) },
      data,
    });
  }

  /**
   * Delete a Stripe event by ID
   *
   * @param id - The Stripe event ID to delete
   * @returns Promise resolving to the deleted Stripe event
   */
  async delete(id: number | string): Promise<StripeEvent> {
    return prisma.stripeEvent.delete({
      where: { id: Number(id) },
    });
  }
}
