/**
 * Session Query Types
 *
 * Query types for Session entity operations.
 */

import type { Session } from "../entities/session";
import type { WhereInput, CreateInput, UpdateInput, OrderBy } from "./base";

export type SessionWhereInput = WhereInput<Session>;
export type SessionCreateInput = CreateInput<Session>;
export type SessionUpdateInput = UpdateInput<Session>;
export type SessionOrderBy = OrderBy<Session>;
