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
import { prisma } from "../libs/prisma";

/**
 * Get all stripe events matching optional filter conditions
 */
async function getAllStripeEvents(
    where?: StripeEventWhereInput
): Promise<StripeEvent[]> {
    return prisma.stripeEvent.findMany({
        where: where as Prisma.StripeEventWhereInput,
    }) as unknown as StripeEvent[];
}

/**
 * Get a stripe event by ID
 */
async function getStripeEventById(
    id: number | string
): Promise<StripeEvent | null> {
    return prisma.stripeEvent.findUnique({
        where: { id: Number(id) },
    }) as unknown as StripeEvent | null;
}

/**
 * Create a new stripe event
 */
async function createStripeEvent(
    data: StripeEventCreateInput
): Promise<StripeEvent> {
    return prisma.stripeEvent.create({
        data: data as Prisma.StripeEventCreateInput,
    }) as unknown as StripeEvent;
}

/**
 * Update an existing stripe event
 */
async function updateStripeEvent(
    id: number | string,
    data: StripeEventUpdateInput
): Promise<StripeEvent> {
    return prisma.stripeEvent.update({
        where: { id: Number(id) },
        data: data as Prisma.StripeEventUpdateInput,
    }) as unknown as StripeEvent;
}

/**
 * Delete a stripe event by ID
 */
async function deleteStripeEvent(id: number | string): Promise<StripeEvent> {
    return prisma.stripeEvent.delete({
        where: { id: Number(id) },
    }) as unknown as StripeEvent;
}

export default {
    getAllStripeEvents,
    getStripeEventById,
    createStripeEvent,
    updateStripeEvent,
    deleteStripeEvent,
};
