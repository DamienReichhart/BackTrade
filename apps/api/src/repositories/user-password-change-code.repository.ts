/**
 * User Password Change Code Repository
 *
 * Data access layer for UserPasswordChangeCode model operations.
 */

import type {
  Prisma,
  UserPasswordChangeCode,
} from "../generated/prisma/client";
import { prisma } from "../libs/prisma";

/**
 * Get all user password change codes matching optional filter conditions
 */
export async function getAllUserPasswordChangeCodes(
  where?: Prisma.UserPasswordChangeCodeWhereInput,
): Promise<UserPasswordChangeCode[]> {
  return prisma.userPasswordChangeCode.findMany({ where });
}

/**
 * Get a user password change code by code
 */
export async function getUserPasswordChangeCodeByCode(
  code: number | string,
): Promise<UserPasswordChangeCode | null> {
  return prisma.userPasswordChangeCode.findUnique({
    where: { code: String(code) },
  });
}

/**
 * Create a new user password change code
 */
export async function createUserPasswordChangeCode(
  data: Prisma.UserPasswordChangeCodeCreateInput,
): Promise<UserPasswordChangeCode> {
  return prisma.userPasswordChangeCode.create({ data });
}

/**
 * Update an existing user password change code
 */
export async function updateUserPasswordChangeCode(
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
 */
export async function deleteUserPasswordChangeCode(
  code: number | string,
): Promise<UserPasswordChangeCode> {
  return prisma.userPasswordChangeCode.delete({
    where: { code: String(code) },
  });
}
