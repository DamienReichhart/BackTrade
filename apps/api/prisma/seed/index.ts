import { prisma } from "../../src/libs/prisma";
import { getPlans } from "./plans";
import { getUsers } from "./users";
import { getInstruments } from "./instruments";

async function seed() {
    console.log("🌱 Starting database seed...");

    const [users, plans, instruments] = await Promise.all([
        getUsers(),
        getPlans(),
        getInstruments(),
    ]);

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

    for (const instrument of instruments) {
        await prisma.instrument.upsert({
            where: { symbol: instrument.symbol },
            update: {
                display_name: instrument.display_name,
                pip_size: instrument.pip_size,
            },
            create: {
                symbol: instrument.symbol,
                display_name: instrument.display_name,
                pip_size: instrument.pip_size,
            },
        });
        console.log(`  ✓ Upserted instrument: ${instrument.symbol}`);
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
