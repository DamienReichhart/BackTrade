/**
 * Transaction Repository
 *
 * Data access layer for Transaction model operations.
 */

import type { Prisma } from "../generated/prisma/client";
import type {
    Transaction,
    TransactionWhereInput,
    TransactionCreateInput,
    TransactionUpdateInput,
} from "@backtrade/types";
import { BasePostgresRepository } from "./base-repository";

/**
 * Repository for Transaction model CRUD operations.
 */
class TransactionsRepository extends BasePostgresRepository {
    /**
     * Get all transactions matching optional filter conditions.
     *
     * @param where - Optional filter conditions
     * @returns Array of matching transactions
     */
    async getAllTransactions(
        where?: TransactionWhereInput
    ): Promise<Transaction[]> {
        return this.prisma.transaction.findMany({
            where: where as Prisma.TransactionWhereInput,
        }) as unknown as Transaction[];
    }

    /**
     * Get a transaction by ID.
     *
     * @param id - Transaction ID as number or string
     * @returns Transaction entity or null if not found
     */
    async getTransactionById(id: number | string): Promise<Transaction | null> {
        return this.prisma.transaction.findUnique({
            where: { id: this.toNumericId(id) },
        }) as unknown as Transaction | null;
    }

    /**
     * Create a new transaction.
     *
     * @param data - Transaction creation data
     * @returns Created transaction entity
     */
    async createTransaction(
        data: TransactionCreateInput
    ): Promise<Transaction> {
        return this.prisma.transaction.create({
            data: data as Prisma.TransactionCreateInput,
        }) as unknown as Transaction;
    }

    /**
     * Update an existing transaction.
     *
     * @param id - Transaction ID as number or string
     * @param data - Transaction update data
     * @returns Updated transaction entity
     */
    async updateTransaction(
        id: number | string,
        data: TransactionUpdateInput
    ): Promise<Transaction> {
        return this.prisma.transaction.update({
            where: { id: this.toNumericId(id) },
            data: data as Prisma.TransactionUpdateInput,
        }) as unknown as Transaction;
    }

    /**
     * Delete a transaction by ID.
     *
     * @param id - Transaction ID as number or string
     * @returns Deleted transaction entity
     */
    async deleteTransaction(id: number | string): Promise<Transaction> {
        return this.prisma.transaction.delete({
            where: { id: this.toNumericId(id) },
        }) as unknown as Transaction;
    }
}

const transactionsRepo = new TransactionsRepository();

export default transactionsRepo;
