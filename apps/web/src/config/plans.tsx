import type { PricingTierCode } from "@backtrade/types";

/**
 * Presentation metadata for a plan, keyed by plan code.
 *
 * Price / currency / max sessions come from the API; this module owns the
 * marketing copy and tier ordering shared by the public pricing page and the
 * logged-in plan management page.
 */
export interface PlanPresentation {
    code: PricingTierCode;
    displayName: string;
    tagline: string;
    features: string[];
    tierRank: number;
    recommended: boolean;
}

export const PLAN_PRESENTATION: Record<PricingTierCode, PlanPresentation> = {
    FREE: {
        code: "FREE",
        displayName: "Free",
        tagline: "Start",
        tierRank: 0,
        recommended: false,
        features: [
            "1 active session",
            "Deterministic OHLCV engine",
            "Market entries • immediate fills",
            "Fixed spread, slippage, commission",
            "Session analytics + JSON export",
        ],
    },
    TRADER: {
        code: "TRADER",
        displayName: "Trader",
        tagline: "Scale",
        tierRank: 1,
        recommended: true,
        features: [
            "10 active sessions",
            "All Free features",
            "Multi-session run",
            "Export equity curve and trades table",
        ],
    },
    EXPERT: {
        code: "EXPERT",
        displayName: "Expert",
        tagline: "Max",
        tierRank: 2,
        recommended: false,
        features: [
            "30 active sessions",
            "All Trader features",
            "Highest parallelism within quota",
        ],
    },
};

/**
 * Presentation for a plan code, falling back to Free for unknown codes.
 */
export function getPlanPresentation(code: string): PlanPresentation {
    return PLAN_PRESENTATION[code as PricingTierCode] ?? PLAN_PRESENTATION.FREE;
}

/**
 * Numeric tier rank used to label upgrades vs. downgrades.
 */
export function getTierRank(code: string): number {
    return getPlanPresentation(code).tierRank;
}
