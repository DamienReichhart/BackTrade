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
    TransactionOrderBy,
} from "@backtrade/types";
import { BasePostgresRepository } from "./base-repository";

export interface FindAllOptions {
    where?: TransactionWhereInput;
    skip?: number;
    take?: number;
    orderBy?: TransactionOrderBy;
}

/**
 * Repository for Transaction model CRUD operations with pagination and sorting.
 */
class TransactionsRepository extends BasePostgresRepository {
    /**
     * Find transactions with optional filtering, pagination, and sorting.
     *
     * @param options - Optional filter, pagination, and sorting options
     * @returns Array of matching transactions
     */
    async findTransactions(options?: FindAllOptions): Promise<Transaction[]> {
        return this.prisma.transaction.findMany({
            where: options?.where as Prisma.TransactionWhereInput | undefined,
            skip: options?.skip,
            take: options?.take,
            orderBy: options?.orderBy as
                | Prisma.TransactionOrderByWithRelationInput
                | undefined,
        }) as unknown as Transaction[];
    }

    /**
     * Get all transactions matching optional filter, pagination, and sorting.
     *
     * @deprecated Use findTransactions instead
     * @param options - Optional filter, pagination, and sorting options
     * @returns Array of matching transactions
     */
    async getAllTransactions(options?: FindAllOptions): Promise<Transaction[]> {
        return this.findTransactions(options);
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
    /**
     * Get all transactions for a specific session.
     *
     * @param sessionId - Session ID as number or string
     * @returns Array of transactions belonging to the session
     */
    async getTransactionsBySessionId(
        sessionId: number | string
    ): Promise<Transaction[]> {
        return this.prisma.transaction.findMany({
            where: { session_id: this.toNumericId(sessionId) },
        }) as unknown as Transaction[];
    }
}

const transactionsRepo = new TransactionsRepository();

export default transactionsRepo;
