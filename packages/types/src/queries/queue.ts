/**
 * QueueJob Query Types
 *
 * Query types for QueueJob entity operations.
 */

import type { QueueJob } from "../entities/queue";
import type { WhereInput, CreateInput, UpdateInput, OrderBy } from "./base";

export type QueueJobWhereInput = WhereInput<QueueJob>;
export type QueueJobCreateInput = CreateInput<QueueJob>;
export type QueueJobUpdateInput = UpdateInput<QueueJob>;
export type QueueJobOrderBy = OrderBy<QueueJob>;
