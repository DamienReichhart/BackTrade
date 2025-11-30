import { Role } from "../../src/generated/prisma/client";
import hashService from "../../src/services/security/hash.service";

export async function getUsers() {
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
