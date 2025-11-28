import type { User, Prisma } from "../../generated/prisma/client";
import usersRepo from "../../repositories/users.repository";
import usersCacheService from "../cache/users.cache.service"

async function getUserById(id: number): Promise<User | null> {
  const cachedUser = await usersCacheService.getCachedUser(id);
  if (cachedUser) {
    return cachedUser;
  }
  const user = await usersRepo.getUserById(id);
  if (user) {
    await usersCacheService.cacheUser(id, user);
  }
  return user;
}

async function createUser(data: Prisma.UserCreateInput): Promise<User> {
  const user = await usersRepo.createUser(data);
  await usersCacheService.cacheUser(user.id, user);
  return user;
}

async function updateUser(id: number, data: Prisma.UserUpdateInput): Promise<User> {
  const user = await usersRepo.updateUser(id, data);
  await usersCacheService.cacheUser(id, user);
  return user;
}

async function deleteUser(id: number): Promise<void> {
  await usersRepo.deleteUser(id);
  await usersCacheService.invalidateCachedUser(id);
}

async function getAllUsers(where?: Prisma.UserWhereInput): Promise<User[]> {
  const users = await usersRepo.getAllUsers(where);
  return users;
}

export default {
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getAllUsers,
};