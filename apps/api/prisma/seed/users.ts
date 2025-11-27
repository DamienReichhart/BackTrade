import { Role } from "../../src/generated/prisma/client";
import { hashPassword } from "../../src/services/hash.service";

export async function getUsers() {
  return [
    {
      email: "admin@backtrade.damien-reichhart.fr",
      password_hash: await hashPassword("TheMostSecuredPasswordInTheWorld"),
      role: Role.ADMIN,
    },
  ];
}
