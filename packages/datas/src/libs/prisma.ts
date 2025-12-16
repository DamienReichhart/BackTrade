/**
 * Prisma Client Initialization
 *
 * Database client singleton for the @backtrade/datas package.
 * Reads DATABASE_URL from environment variables.
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString || connectionString === "") {
    throw new Error("DATABASE_URL environment variable is not set or is empty");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };
