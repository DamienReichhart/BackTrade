/**
 * Candle Query Types
 *
 * Query types for Candle entity operations.
 */

import type { Candle } from "../entities/candle";
import type { WhereInput, CreateInput, OrderBy } from "./base";

export type CandleWhereInput = WhereInput<Candle>;
export type CandleCreateInput = CreateInput<Candle>;
export type CandleOrderBy = OrderBy<Candle>;
