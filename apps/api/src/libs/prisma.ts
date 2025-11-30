import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { ENV } from "../config/env";

const connectionString = `${ENV.DATABASE_URL}`;

if (!connectionString || connectionString === "") {
  throw new Error("DATABASE_URL is not set or is empty");
}

const adapter = new PrismaPg({ connectionString: connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };
