import { type PlanFeature } from "./plan";

/**
 * Pricing tier interface
 */
export interface PricingTier {
  id?: number;
  code: string;
  name: string;
  price: number;
  currency: string;
  period: string;
  description: string;
  badge?: string;
  badgeVariant?: "default" | "popular" | "premium";
  features: PlanFeature[];
  ctaText: string;
  ctaVariant: "outline" | "primary" | "secondary";
  highlighted?: boolean;
  stripeProductId?: string;
  stripePriceId?: string;
}
