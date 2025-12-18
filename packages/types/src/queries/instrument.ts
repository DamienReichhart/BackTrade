/**
 * Instrument Query Types
 *
 * Query types for Instrument entity operations.
 */

import type { Instrument } from "../entities/instrument";
import type { WhereInput, CreateInput, UpdateInput, OrderBy } from "./base";

export type InstrumentWhereInput = WhereInput<Instrument>;
export type InstrumentCreateInput = CreateInput<Instrument>;
export type InstrumentUpdateInput = UpdateInput<Instrument>;
export type InstrumentOrderBy = OrderBy<Instrument>;
