/**
 * Dataset Query Types
 *
 * Query types for Dataset entity operations.
 */

import type { Dataset } from "../entities/dataset";
import type { WhereInput, CreateInput, UpdateInput, OrderBy } from "./base";

export type DatasetWhereInput = WhereInput<Dataset>;
export type DatasetCreateInput = CreateInput<Dataset>;
export type DatasetUpdateInput = UpdateInput<Dataset>;
export type DatasetOrderBy = OrderBy<Dataset>;
