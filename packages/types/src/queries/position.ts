/**
 * Position Query Types
 *
 * Query types for Position entity operations.
 */

import type { Position } from "../entities/position";
import type { WhereInput, CreateInput, UpdateInput, OrderBy } from "./base";

export type PositionWhereInput = WhereInput<Position>;
export type PositionCreateInput = CreateInput<Position>;
export type PositionUpdateInput = UpdateInput<Position>;
export type PositionOrderBy = OrderBy<Position>;
