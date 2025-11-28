/**
 * Plan Repository
 *
 * Data access layer for subscription Plan model operations.
 */

import type { Plan, Prisma } from "../generated/prisma/client";
import { prisma } from "../libs/prisma";

/**
 * Get all plans matching optional filter conditions
 */
async function getAllPlans(
  where?: Prisma.PlanWhereInput,
): Promise<Plan[]> {
  return prisma.plan.findMany({ where });
}

/**
 * Get a plan by ID
 */
async function getPlanById(id: number | string): Promise<Plan | null> {
  return prisma.plan.findUnique({
    where: { id: Number(id) },
  });
}

/**
 * Create a new plan
 */
async function createPlan(data: Prisma.PlanCreateInput): Promise<Plan> {
  return prisma.plan.create({ data });
}

/**
 * Update an existing plan
 */
async function updatePlan(
  id: number | string,
  data: Prisma.PlanUpdateInput,
): Promise<Plan> {
  return prisma.plan.update({
    where: { id: Number(id) },
    data,
  });
}

/**
 * Delete a plan by ID
 */
async function deletePlan(id: number | string): Promise<Plan> {
  return prisma.plan.delete({
    where: { id: Number(id) },
  });
}

export default {
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
};
