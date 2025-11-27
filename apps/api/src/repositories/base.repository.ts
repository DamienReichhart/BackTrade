import type { Prisma } from "../generated/prisma/client";

/**
 * Base repository interface defining common CRUD operations
 *
 * @template T - The Prisma model type
 * @template CreateInput - The Prisma create input type
 * @template UpdateInput - The Prisma update input type
 * @template WhereInput - The Prisma where input type
 */
export interface IBaseRepository<
  T,
  CreateInput,
  UpdateInput,
  WhereInput = Prisma.Args<T, "findFirst">["where"],
> {
  /**
   * Get all records
   *
   * @param where - Optional filter conditions
   * @returns Promise resolving to an array of records
   */
  getAll(where?: WhereInput): Promise<T[]>;

  /**
   * Get a single record by ID
   *
   * @param id - The unique identifier of the record
   * @returns Promise resolving to the record or null if not found
   */
  getById(id: number | string): Promise<T | null>;

  /**
   * Create a new record
   *
   * @param data - The data to create the record with
   * @returns Promise resolving to the created record
   */
  add(data: CreateInput): Promise<T>;

  /**
   * Update an existing record
   *
   * @param id - The unique identifier of the record to update
   * @param data - The data to update the record with
   * @returns Promise resolving to the updated record
   */
  update(id: number | string, data: UpdateInput): Promise<T>;

  /**
   * Delete a record by ID
   *
   * @param id - The unique identifier of the record to delete
   * @returns Promise resolving to the deleted record
   */
  delete(id: number | string): Promise<T>;
}

