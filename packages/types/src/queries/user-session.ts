/**
 * UserSession Query Types
 *
 * Query types for UserSession entity operations.
 */

import type { UserSession } from "../entities/user";
import type { WhereInput, CreateInput, UpdateInput, OrderBy } from "./base";

export type UserSessionWhereInput = WhereInput<UserSession>;
export type UserSessionCreateInput = CreateInput<UserSession>;
export type UserSessionUpdateInput = UpdateInput<UserSession>;
export type UserSessionOrderBy = OrderBy<UserSession>;
