import { prisma } from "../../src/libs/prisma";
import { users } from "./users";

async function seed() {
  console.log("🌱 Starting database seed...");

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: user,
      create: user,
    });
    console.log(`  ✓ Upserted user: ${user.email}`);
  }

  console.log("✅ Seed completed successfully");
}

seed()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });