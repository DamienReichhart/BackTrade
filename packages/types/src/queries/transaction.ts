/**
 * Transaction Query Types
 *
 * Query types for Transaction entity operations.
 */

import type { Transaction } from "../entities/transaction";
import type { WhereInput, CreateInput, UpdateInput, OrderBy } from "./base";

export type TransactionWhereInput = WhereInput<Transaction>;
export type TransactionCreateInput = CreateInput<Transaction>;
export type TransactionUpdateInput = UpdateInput<Transaction>;
export type TransactionOrderBy = OrderBy<Transaction>;
