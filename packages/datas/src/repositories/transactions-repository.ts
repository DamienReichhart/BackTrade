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
import { prisma } from "../libs/prisma";

/**
 * Get all transactions matching optional filter conditions
 */
async function getAllTransactions(
    where?: TransactionWhereInput
): Promise<Transaction[]> {
    return prisma.transaction.findMany({
        where: where as Prisma.TransactionWhereInput,
    }) as unknown as Transaction[];
}

/**
 * Get a transaction by ID
 */
async function getTransactionById(
    id: number | string
): Promise<Transaction | null> {
    return prisma.transaction.findUnique({
        where: { id: Number(id) },
    }) as unknown as Transaction | null;
}

/**
 * Create a new transaction
 */
async function createTransaction(
    data: TransactionCreateInput
): Promise<Transaction> {
    return prisma.transaction.create({
        data: data as Prisma.TransactionCreateInput,
    }) as unknown as Transaction;
}

/**
 * Update an existing transaction
 */
async function updateTransaction(
    id: number | string,
    data: TransactionUpdateInput
): Promise<Transaction> {
    return prisma.transaction.update({
        where: { id: Number(id) },
        data: data as Prisma.TransactionUpdateInput,
    }) as unknown as Transaction;
}

/**
 * Delete a transaction by ID
 */
async function deleteTransaction(id: number | string): Promise<Transaction> {
    return prisma.transaction.delete({
        where: { id: Number(id) },
    }) as unknown as Transaction;
}

export default {
    getAllTransactions,
    getTransactionById,
    createTransaction,
    updateTransaction,
    deleteTransaction,
};
