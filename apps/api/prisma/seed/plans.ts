export interface SeedPlan {
    id: number;
    code: string;
    stripe_product_id: string;
    stripe_price_id: string;
    currency: string;
    price: number;
    max_active_sessions: number;
}

/**
 * Returns the list of subscription plans to seed in the database.
 */
export async function getPlans(): Promise<SeedPlan[]> {
    return [
        {
            id: 1,
            code: "TRADER",
            stripe_product_id: "prod_Tm1WYezRpCShtb",
            stripe_price_id: "price_1SoTTAI0H7dj41TROUvmOeyy",
            currency: "USD",
            price: 19,
            max_active_sessions: 10,
        },
        {
            id: 2,
            code: "EXPERT",
            stripe_product_id: "prod_Tm1W4IrS1CdDBM",
            stripe_price_id: "price_1SoTTlI0H7dj41TRig7QlRUr",
            currency: "USD",
            price: 49,
            max_active_sessions: 30,
        },
    ];
}
