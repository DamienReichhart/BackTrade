import type {
    BadgeVariant,
    ButtonVariant,
    PricingTierCode,
} from "@backtrade/types";
import { type PlanFeature } from "./plan";

/**
 * Pricing tier interface
 */
export interface PricingTier {
    id?: number;
    code: PricingTierCode;
    name: string;
    price: number;
    currency: string;
    period: string;
    description: string;
    badge?: string;
    badgeVariant?: BadgeVariant;
    features: PlanFeature[];
    ctaText: string;
    ctaVariant: ButtonVariant;
    highlighted?: boolean;
    stripeProductId?: string;
    stripePriceId?: string;
}
