/**
 * Prisma Client Initialization
 *
 * Database client singleton for the @backtrade/data package.
 * Reads DATABASE_URL from environment variables.
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { ENV } from "../config/ENV";

if (!ENV.DATABASE_URL || ENV.DATABASE_URL === "") {
    throw new Error("DATABASE_URL environment variable is not set or is empty");
}
const adapter = new PrismaPg({ connectionString: ENV.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export { prisma };
