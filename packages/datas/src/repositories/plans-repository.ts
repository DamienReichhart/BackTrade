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
import { BasePostgresRepository } from "./base-repository";

/**
 * Repository for Plan model CRUD operations.
 */
class PlansRepository extends BasePostgresRepository {
    /**
     * Get all plans matching optional filter conditions.
     *
     * @param where - Optional filter conditions
     * @returns Array of matching plans
     */
    async getAllPlans(where?: PlanWhereInput): Promise<Plan[]> {
        return this.prisma.plan.findMany({
            where: where as Prisma.PlanWhereInput,
        }) as unknown as Plan[];
    }

    /**
     * Get a plan by ID.
     *
     * @param id - Plan ID as number or string
     * @returns Plan entity or null if not found
     */
    async getPlanById(id: number | string): Promise<Plan | null> {
        return this.prisma.plan.findUnique({
            where: { id: this.toNumericId(id) },
        }) as unknown as Plan | null;
    }

    /**
     * Create a new plan.
     *
     * @param data - Plan creation data
     * @returns Created plan entity
     */
    async createPlan(data: PlanCreateInput): Promise<Plan> {
        return this.prisma.plan.create({
            data: data as Prisma.PlanCreateInput,
        }) as unknown as Plan;
    }

    /**
     * Update an existing plan.
     *
     * @param id - Plan ID as number or string
     * @param data - Plan update data
     * @returns Updated plan entity
     */
    async updatePlan(
        id: number | string,
        data: PlanUpdateInput
    ): Promise<Plan> {
        return this.prisma.plan.update({
            where: { id: this.toNumericId(id) },
            data: data as Prisma.PlanUpdateInput,
        }) as unknown as Plan;
    }

    /**
     * Delete a plan by ID.
     *
     * @param id - Plan ID as number or string
     * @returns Deleted plan entity
     */
    async deletePlan(id: number | string): Promise<Plan> {
        return this.prisma.plan.delete({
            where: { id: this.toNumericId(id) },
        }) as unknown as Plan;
    }
}

const plansRepo = new PlansRepository();

export default plansRepo;
