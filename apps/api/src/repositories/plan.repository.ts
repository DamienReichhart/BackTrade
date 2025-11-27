import type { Prisma, Plan } from "../generated/prisma/client";
import { prisma } from "../libs/prisma";
import type { IBaseRepository } from "./base.repository";

/**
 * Repository for Plan model operations
 *
 * Provides CRUD operations for managing subscription plans in the database
 */
export class PlanRepository
  implements
    IBaseRepository<
      Plan,
      Prisma.PlanCreateInput,
      Prisma.PlanUpdateInput,
      Prisma.PlanWhereInput
    >
{
  /**
   * Get all plans
   *
   * @param where - Optional filter conditions
   * @returns Promise resolving to an array of plans
   */
  async getAll(where?: Prisma.PlanWhereInput): Promise<Plan[]> {
    return prisma.plan.findMany({
      where,
    });
  }

  /**
   * Get a plan by ID
   *
   * @param id - The plan ID
   * @returns Promise resolving to the plan or null if not found
   */
  async getById(id: number | string): Promise<Plan | null> {
    return prisma.plan.findUnique({
      where: { id: Number(id) },
    });
  }

  /**
   * Create a new plan
   *
   * @param data - The plan data to create
   * @returns Promise resolving to the created plan
   */
  async add(data: Prisma.PlanCreateInput): Promise<Plan> {
    return prisma.plan.create({
      data,
    });
  }

  /**
   * Update an existing plan
   *
   * @param id - The plan ID to update
   * @param data - The plan data to update
   * @returns Promise resolving to the updated plan
   */
  async update(
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
   *
   * @param id - The plan ID to delete
   * @returns Promise resolving to the deleted plan
   */
  async delete(id: number | string): Promise<Plan> {
    return prisma.plan.delete({
      where: { id: Number(id) },
    });
  }
}
