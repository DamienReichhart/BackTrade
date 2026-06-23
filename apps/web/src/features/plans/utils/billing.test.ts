import { formatMoney, formatPeriodDate, statusLabel } from "./billing";

describe("billing utils", () => {
    it("formats money with currency", () => {
        expect(formatMoney(19, "eur")).toMatch(/19/);
        expect(formatMoney(19, "eur")).toMatch(/€|EUR/);
    });

    it("formats a null period date as an em dash", () => {
        expect(formatPeriodDate(null)).toBe("—");
    });

    it("labels a canceling status with the period end date", () => {
        const label = statusLabel("canceling", "2026-07-14T00:00:00.000Z");
        expect(label.toLowerCase()).toContain("cancel");
    });

    it("labels free with no date", () => {
        expect(statusLabel("free", null).toLowerCase()).toContain("free");
    });
});
