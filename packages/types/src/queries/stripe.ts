/**
 * StripeEvent Query Types
 *
 * Query types for StripeEvent entity operations.
 */

import type { StripeEvent } from "../entities/stripe";
import type { WhereInput, CreateInput, UpdateInput, OrderBy } from "./base";

export type StripeEventWhereInput = WhereInput<StripeEvent>;
export type StripeEventCreateInput = CreateInput<StripeEvent>;
export type StripeEventUpdateInput = UpdateInput<StripeEvent>;
export type StripeEventOrderBy = OrderBy<StripeEvent>;
