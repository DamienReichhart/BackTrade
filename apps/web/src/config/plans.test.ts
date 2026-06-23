import { getPlanPresentation, getTierRank, PLAN_PRESENTATION } from "./plans";

describe("plan presentation config", () => {
    it("ranks tiers Free < Trader < Expert", () => {
        expect(getTierRank("FREE")).toBe(0);
        expect(getTierRank("TRADER")).toBe(1);
        expect(getTierRank("EXPERT")).toBe(2);
    });

    it("marks Trader as recommended", () => {
        expect(PLAN_PRESENTATION.TRADER.recommended).toBe(true);
    });

    it("falls back to Free for an unknown code", () => {
        expect(getPlanPresentation("WAT").code).toBe("FREE");
    });

    it("provides non-empty feature lists", () => {
        expect(PLAN_PRESENTATION.EXPERT.features.length).toBeGreaterThan(0);
    });
});
