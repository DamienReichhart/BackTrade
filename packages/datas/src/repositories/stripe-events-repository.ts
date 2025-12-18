/**
 * Stripe Event Repository
 *
 * Data access layer for StripeEvent model operations.
 */

import type { Prisma } from "../generated/prisma/client";
import type {
    StripeEvent,
    StripeEventWhereInput,
    StripeEventCreateInput,
    StripeEventUpdateInput,
} from "@backtrade/types";
import { BasePostgresRepository } from "./base-repository";

/**
 * Repository for StripeEvent model CRUD operations.
 */
class StripeEventsRepository extends BasePostgresRepository {
    /**
     * Get all stripe events matching optional filter conditions.
     *
     * @param where - Optional filter conditions
     * @returns Array of matching stripe events
     */
    async getAllStripeEvents(
        where?: StripeEventWhereInput
    ): Promise<StripeEvent[]> {
        return this.prisma.stripeEvent.findMany({
            where: where as Prisma.StripeEventWhereInput,
        }) as unknown as StripeEvent[];
    }

    /**
     * Get a stripe event by ID.
     *
     * @param id - StripeEvent ID as number or string
     * @returns StripeEvent entity or null if not found
     */
    async getStripeEventById(id: number | string): Promise<StripeEvent | null> {
        return this.prisma.stripeEvent.findUnique({
            where: { id: this.toNumericId(id) },
        }) as unknown as StripeEvent | null;
    }

    /**
     * Create a new stripe event.
     *
     * @param data - StripeEvent creation data
     * @returns Created stripe event entity
     */
    async createStripeEvent(
        data: StripeEventCreateInput
    ): Promise<StripeEvent> {
        return this.prisma.stripeEvent.create({
            data: data as Prisma.StripeEventCreateInput,
        }) as unknown as StripeEvent;
    }

    /**
     * Update an existing stripe event.
     *
     * @param id - StripeEvent ID as number or string
     * @param data - StripeEvent update data
     * @returns Updated stripe event entity
     */
    async updateStripeEvent(
        id: number | string,
        data: StripeEventUpdateInput
    ): Promise<StripeEvent> {
        return this.prisma.stripeEvent.update({
            where: { id: this.toNumericId(id) },
            data: data as Prisma.StripeEventUpdateInput,
        }) as unknown as StripeEvent;
    }

    /**
     * Delete a stripe event by ID.
     *
     * @param id - StripeEvent ID as number or string
     * @returns Deleted stripe event entity
     */
    async deleteStripeEvent(id: number | string): Promise<StripeEvent> {
        return this.prisma.stripeEvent.delete({
            where: { id: this.toNumericId(id) },
        }) as unknown as StripeEvent;
    }
}

const stripeEventsRepo = new StripeEventsRepository();

export default stripeEventsRepo;
