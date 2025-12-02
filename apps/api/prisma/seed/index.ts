import { prisma } from "../../src/libs/prisma";
import { getPlans } from "./plans";
import { getUsers } from "./users";

async function seed() {
  console.log("🌱 Starting database seed...");

  const [users, plans] = await Promise.all([getUsers(), getPlans()]);

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        role: user.role,
        password_hash: user.password_hash,
      },
      create: {
        email: user.email,
        password_hash: user.password_hash,
        role: user.role,
      },
    });
    console.log(`  ✓ Upserted user: ${user.email}`);
  }

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { code: plan.code },
      update: {
        stripe_product_id: plan.stripe_product_id,
        stripe_price_id: plan.stripe_price_id,
        currency: plan.currency,
        price: plan.price,
      },
      create: {
        id: plan.id,
        code: plan.code,
        stripe_product_id: plan.stripe_product_id,
        stripe_price_id: plan.stripe_price_id,
        currency: plan.currency,
        price: plan.price,
      },
    });
    console.log(`  ✓ Upserted plan: ${plan.code}`);
  }

  console.log("Seed completed successfully");
}

seed()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
