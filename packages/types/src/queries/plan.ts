/**
 * Plan Query Types
 *
 * Query types for Plan entity operations.
 */

import type { Plan } from "../entities/plan";
import type { WhereInput, CreateInput, UpdateInput, OrderBy } from "./base";

export type PlanWhereInput = WhereInput<Plan>;
export type PlanCreateInput = CreateInput<Plan>;
export type PlanUpdateInput = UpdateInput<Plan>;
export type PlanOrderBy = OrderBy<Plan>;
