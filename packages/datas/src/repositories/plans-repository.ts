/**
 * Plan Repository
 *
 * Data access layer for subscription Plan model operations.
 */

import type { Prisma } from "../generated/prisma/client";
import type {
    Plan,
    PlanWhereInput,
    PlanCreateInput,
    PlanUpdateInput,
} from "@backtrade/types";
import { prisma } from "../libs/prisma";

/**
 * Get all plans matching optional filter conditions
 */
async function getAllPlans(where?: PlanWhereInput): Promise<Plan[]> {
    return prisma.plan.findMany({
        where: where as Prisma.PlanWhereInput,
    }) as unknown as Plan[];
}

/**
 * Get a plan by ID
 */
async function getPlanById(id: number | string): Promise<Plan | null> {
    return prisma.plan.findUnique({
        where: { id: Number(id) },
    }) as unknown as Plan | null;
}

/**
 * Create a new plan
 */
async function createPlan(data: PlanCreateInput): Promise<Plan> {
    return prisma.plan.create({
        data: data as Prisma.PlanCreateInput,
    }) as unknown as Plan;
}

/**
 * Update an existing plan
 */
async function updatePlan(
    id: number | string,
    data: PlanUpdateInput
): Promise<Plan> {
    return prisma.plan.update({
        where: { id: Number(id) },
        data: data as Prisma.PlanUpdateInput,
    }) as unknown as Plan;
}

/**
 * Delete a plan by ID
 */
async function deletePlan(id: number | string): Promise<Plan> {
    return prisma.plan.delete({
        where: { id: Number(id) },
    }) as unknown as Plan;
}

export default {
    getAllPlans,
    getPlanById,
    createPlan,
    updatePlan,
    deletePlan,
};
