export interface SeedPlan {
  id: number;
  code: string;
  stripe_product_id: string;
  stripe_price_id: string;
  currency: string;
  price: number;
}

/**
 * Returns the list of subscription plans to seed in the database.
 */
export async function getPlans(): SeedPlan[] {
  return [
    {
      id: 1,
      code: "FREE",
      stripe_product_id: "prod_basic",
      stripe_price_id: "price_free_monthly",
      currency: "EUR",
      price: 0,
    },
    {
      id: 2,
      code: "TRADER",
      stripe_product_id: "prod_pro",
      stripe_price_id: "price_trader_monthly",
      currency: "EUR",
      price: 19,
    },
    {
      id: 3,
      code: "EXPERT",
      stripe_product_id: "prod_enterprise",
      stripe_price_id: "price_expert_monthly",
      currency: "EUR",
      price: 49,
    },
  ];
}


