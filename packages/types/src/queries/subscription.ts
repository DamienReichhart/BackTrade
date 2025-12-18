/**
 * Subscription Query Types
 *
 * Query types for Subscription entity operations.
 */

import type { Subscription } from "../entities/subscription";
import type { WhereInput, CreateInput, UpdateInput, OrderBy } from "./base";

export type SubscriptionWhereInput = WhereInput<Subscription>;
export type SubscriptionCreateInput = CreateInput<Subscription>;
export type SubscriptionUpdateInput = UpdateInput<Subscription>;
export type SubscriptionOrderBy = OrderBy<Subscription>;
