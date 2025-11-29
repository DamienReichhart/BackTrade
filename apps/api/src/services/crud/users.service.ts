import type { User, Prisma } from "../../generated/prisma/client";
import usersRepo from "../../repositories/users.repository";
import usersCacheService from "../cache/users.cache.service";
import { logger } from "../../libs/pino";
import NotFoundError from "../../errors/web/not-found-error";
import AlreadyExistsError from "../../errors/web/already-exists-error";

const userServiceLogger = logger.child({
  service: "user-service",
});

async function getUserById(id: number): Promise<User | null> {
  const cachedUser = await usersCacheService.getCachedUser(id);
  if (cachedUser) {
    userServiceLogger.trace({ id }, "User found in cache");
    return cachedUser;
  }
  userServiceLogger.trace(
    { id },
    "User not found in cache, fetching from database",
  );
  const user = await usersRepo.getUserById(id);
  if (!user) {
    userServiceLogger.debug({ id }, "User not found, throwing not found error");
    throw new NotFoundError("User not found");
  }
  await usersCacheService.cacheUser(id, user);
  userServiceLogger.trace({ id }, "User cached");
  return user;
}

async function createUser(data: Prisma.UserCreateInput): Promise<User> {
  const existingUser = await usersRepo.getUserByEmail(data.email);
  if (existingUser) {
    userServiceLogger.debug(
      { email: data.email },
      "User already exists, throwing already exists error",
    );
    throw new AlreadyExistsError("User already exists");
  }
  const user = await usersRepo.createUser(data);
  userServiceLogger.debug({ id: user.id }, "User created");
  await usersCacheService.cacheUser(user.id, user);
  userServiceLogger.trace({ id: user.id }, "User cached");
  return user;
}

async function updateUser(
  id: number,
  data: Prisma.UserUpdateInput,
): Promise<User> {
  const existingUser = await usersRepo.getUserById(id);
  if (!existingUser) {
    userServiceLogger.debug({ id }, "User not found, throwing not found error");
    throw new NotFoundError("User not found");
  }
  if (existingUser.email !== data.email) {
    const existingUserByEmail = await usersRepo.getUserByEmail(
      data.email as string,
    );
    if (existingUserByEmail) {
      userServiceLogger.debug(
        { email: data.email },
        "User already exists, throwing already exists error",
      );
      throw new AlreadyExistsError("User already exists");
    }
  }
  const user = await usersRepo.updateUser(id, data);
  userServiceLogger.debug({ id: user.id }, "User updated");
  await usersCacheService.cacheUser(id, user);
  userServiceLogger.trace({ id: user.id }, "User cached");
  return user;
}

async function deleteUser(id: number): Promise<void> {
  const existingUser = await usersRepo.getUserById(id);
  if (!existingUser) {
    userServiceLogger.debug({ id }, "User not found, throwing not found error");
    throw new NotFoundError("User not found");
  }
  await usersRepo.deleteUser(id);
  userServiceLogger.debug({ id }, "User deleted");
  await usersCacheService.invalidateCachedUser(id);
  userServiceLogger.trace({ id }, "User invalidated from cache");
}

async function getAllUsers(where?: Prisma.UserWhereInput): Promise<User[]> {
  const users = await usersRepo.getAllUsers(where);
  userServiceLogger.trace({ users }, "Users fetched");
  return users;
}

export default {
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getAllUsers,
};
