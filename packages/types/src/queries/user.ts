/**
 * User Query Types
 *
 * Query types for User entity operations.
 */

import type { User } from "../entities/user";
import type { WhereInput, CreateInput, UpdateInput, OrderBy } from "./base";

export type UserWhereInput = WhereInput<User>;
export type UserCreateInput = CreateInput<User>;
export type UserUpdateInput = UpdateInput<User>;
export type UserOrderBy = OrderBy<User>;
