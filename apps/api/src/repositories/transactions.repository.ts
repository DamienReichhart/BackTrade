/**
 * Transaction Repository
 *
 * Data access layer for Transaction model operations.
 */

import type { Prisma, Transaction } from "../generated/prisma/client";
import { prisma } from "../libs/prisma";

/**
 * Get all transactions matching optional filter conditions
 */
async function getAllTransactions(
  where?: Prisma.TransactionWhereInput,
): Promise<Transaction[]> {
  return prisma.transaction.findMany({ where });
}

/**
 * Get a transaction by ID
 */
async function getTransactionById(
  id: number | string,
): Promise<Transaction | null> {
  return prisma.transaction.findUnique({
    where: { id: Number(id) },
  });
}

/**
 * Create a new transaction
 */
async function createTransaction(
  data: Prisma.TransactionCreateInput,
): Promise<Transaction> {
  return prisma.transaction.create({ data });
}

/**
 * Update an existing transaction
 */
async function updateTransaction(
  id: number | string,
  data: Prisma.TransactionUpdateInput,
): Promise<Transaction> {
  return prisma.transaction.update({
    where: { id: Number(id) },
    data,
  });
}

/**
 * Delete a transaction by ID
 */
async function deleteTransaction(
  id: number | string,
): Promise<Transaction> {
  return prisma.transaction.delete({
    where: { id: Number(id) },
  });
}

export default {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
