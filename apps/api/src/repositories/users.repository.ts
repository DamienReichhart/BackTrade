/**
 * User Repository
 *
 * Data access layer for User model operations.
 */

import type { Prisma, User } from "../generated/prisma/client";
import { prisma } from "../libs/prisma";

/**
 * Get all users matching optional filter conditions
 */
async function getAllUsers(
  where?: Prisma.UserWhereInput,
): Promise<User[]> {
  return prisma.user.findMany({ where });
}

/**
 * Get a user by ID
 */
async function getUserById(id: number | string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { id: Number(id) },
  });
}

/**
 * Create a new user
 */
async function createUser(data: Prisma.UserCreateInput): Promise<User> {
  return prisma.user.create({ data });
}

/**
 * Update an existing user
 */
async function updateUser(
  id: number | string,
  data: Prisma.UserUpdateInput,
): Promise<User> {
  return prisma.user.update({
    where: { id: Number(id) },
    data,
  });
}

/**
 * Delete a user by ID
 */
async function deleteUser(id: number | string): Promise<User> {
  return prisma.user.delete({
    where: { id: Number(id) },
  });
}

export default {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};