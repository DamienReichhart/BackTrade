/**
 * Stripe Event Repository
 *
 * Data access layer for StripeEvent model operations.
 */

import type { Prisma, StripeEvent } from "../generated/prisma/client";
import { prisma } from "../libs/prisma";

/**
 * Get all stripe events matching optional filter conditions
 */
async function getAllStripeEvents(
    where?: Prisma.StripeEventWhereInput
): Promise<StripeEvent[]> {
    return prisma.stripeEvent.findMany({ where });
}

/**
 * Get a stripe event by ID
 */
async function getStripeEventById(
    id: number | string
): Promise<StripeEvent | null> {
    return prisma.stripeEvent.findUnique({
        where: { id: Number(id) },
    });
}

/**
 * Create a new stripe event
 */
async function createStripeEvent(
    data: Prisma.StripeEventCreateInput
): Promise<StripeEvent> {
    return prisma.stripeEvent.create({ data });
}

/**
 * Update an existing stripe event
 */
async function updateStripeEvent(
    id: number | string,
    data: Prisma.StripeEventUpdateInput
): Promise<StripeEvent> {
    return prisma.stripeEvent.update({
        where: { id: Number(id) },
        data,
    });
}

/**
 * Delete a stripe event by ID
 */
async function deleteStripeEvent(id: number | string): Promise<StripeEvent> {
    return prisma.stripeEvent.delete({
        where: { id: Number(id) },
    });
}

export default {
    getAllStripeEvents,
    getStripeEventById,
    createStripeEvent,
    updateStripeEvent,
    deleteStripeEvent,
};
