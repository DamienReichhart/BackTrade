import type { Prisma, Transaction } from "../generated/prisma/client";
import { prisma } from "../libs/prisma";
import type { IBaseRepository } from "./base.repository";

/**
 * Repository for Transaction model operations
 *
 * Provides CRUD operations for managing transactions in the database
 */
export class TransactionRepository
  implements
    IBaseRepository<
      Transaction,
      Prisma.TransactionCreateInput,
      Prisma.TransactionUpdateInput,
      Prisma.TransactionWhereInput
    >
{
  /**
   * Get all transactions
   *
   * @param where - Optional filter conditions
   * @returns Promise resolving to an array of transactions
   */
  async getAll(where?: Prisma.TransactionWhereInput): Promise<Transaction[]> {
    return prisma.transaction.findMany({
      where,
    });
  }

  /**
   * Get a transaction by ID
   *
   * @param id - The transaction ID
   * @returns Promise resolving to the transaction or null if not found
   */
  async getById(id: number | string): Promise<Transaction | null> {
    return prisma.transaction.findUnique({
      where: { id: Number(id) },
    });
  }

  /**
   * Create a new transaction
   *
   * @param data - The transaction data to create
   * @returns Promise resolving to the created transaction
   */
  async add(data: Prisma.TransactionCreateInput): Promise<Transaction> {
    return prisma.transaction.create({
      data,
    });
  }

  /**
   * Update an existing transaction
   *
   * @param id - The transaction ID to update
   * @param data - The transaction data to update
   * @returns Promise resolving to the updated transaction
   */
  async update(
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
   *
   * @param id - The transaction ID to delete
   * @returns Promise resolving to the deleted transaction
   */
  async delete(id: number | string): Promise<Transaction> {
    return prisma.transaction.delete({
      where: { id: Number(id) },
    });
  }
}
