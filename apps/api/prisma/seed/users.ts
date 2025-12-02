import { Role } from "../../src/generated/prisma/client";
import hashService from "../../src/services/security/hash.service";

export interface SeedUser {
  email: string;
  password_hash: string;
  role: Role;
}

/**
 * Returns the list of users to seed in the database.
 */
export async function getUsers(): Promise<SeedUser[]> {
  return [
    {
      email: "admin@backtrade.damien-reichhart.fr",
      password_hash: await hashService.hashPassword(
        "TheMostSecuredPasswordInTheWorld",
      ),
      role: Role.ADMIN,
    },
  ];
}
