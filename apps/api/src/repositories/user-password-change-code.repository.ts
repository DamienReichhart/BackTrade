import type {
  Prisma,
  UserPasswordChangeCode,
} from "../generated/prisma/client";
import { prisma } from "../libs/prisma";
import type { IBaseRepository } from "./base.repository";

/**
 * Repository for UserPasswordChangeCode model operations
 *
 * Provides CRUD operations for managing user password change codes in the database
 */
export class UserPasswordChangeCodeRepository
  implements
    IBaseRepository<
      UserPasswordChangeCode,
      Prisma.UserPasswordChangeCodeCreateInput,
      Prisma.UserPasswordChangeCodeUpdateInput,
      Prisma.UserPasswordChangeCodeWhereInput
    >
{
  /**
   * Get all user password change codes
   *
   * @param where - Optional filter conditions
   * @returns Promise resolving to an array of user password change codes
   */
  async getAll(
    where?: Prisma.UserPasswordChangeCodeWhereInput,
  ): Promise<UserPasswordChangeCode[]> {
    return prisma.userPasswordChangeCode.findMany({
      where,
    });
  }

  /**
   * Get a user password change code by code (primary key)
   *
   * @param code - The password change code
   * @returns Promise resolving to the user password change code or null if not found
   */
  async getById(code: number | string): Promise<UserPasswordChangeCode | null> {
    return prisma.userPasswordChangeCode.findUnique({
      where: { code: String(code) },
    });
  }

  /**
   * Create a new user password change code
   *
   * @param data - The user password change code data to create
   * @returns Promise resolving to the created user password change code
   */
  async add(
    data: Prisma.UserPasswordChangeCodeCreateInput,
  ): Promise<UserPasswordChangeCode> {
    return prisma.userPasswordChangeCode.create({
      data,
    });
  }

  /**
   * Update an existing user password change code
   *
   * @param code - The password change code to update
   * @param data - The user password change code data to update
   * @returns Promise resolving to the updated user password change code
   */
  async update(
    code: number | string,
    data: Prisma.UserPasswordChangeCodeUpdateInput,
  ): Promise<UserPasswordChangeCode> {
    return prisma.userPasswordChangeCode.update({
      where: { code: String(code) },
      data,
    });
  }

  /**
   * Delete a user password change code by code
   *
   * @param code - The password change code to delete
   * @returns Promise resolving to the deleted user password change code
   */
  async delete(code: number | string): Promise<UserPasswordChangeCode> {
    return prisma.userPasswordChangeCode.delete({
      where: { code: String(code) },
    });
  }
}
