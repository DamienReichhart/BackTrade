import { render, screen, fireEvent } from "../../../../test-utils";
import { PlanPicker } from "./PlanPicker";
import type { BillingOverviewResponse, Plan } from "@backtrade/types";

const plans: Plan[] = [
    {
        id: 7,
        code: "TRADER",
        stripe_product_id: "p",
        stripe_price_id: "pr",
        currency: "EUR",
        price: 19,
        max_active_sessions: 10,
    },
    {
        id: 8,
        code: "EXPERT",
        stripe_product_id: "p",
        stripe_price_id: "pr",
        currency: "EUR",
        price: 49,
        max_active_sessions: 30,
    },
];

const overview = {
    status: "active",
    plan: {
        code: "TRADER",
        displayName: "Trader",
        price: 19,
        currency: "eur",
        maxActiveSessions: 10,
    },
} as unknown as BillingOverviewResponse;

it("labels the current plan, upgrades, and downgrades", () => {
    render(
        <PlanPicker
            plans={plans}
            overview={overview}
            onSelectPlan={jest.fn()}
            disabled={false}
        />
    );
    // Free is below Trader -> Downgrade; Trader is current; Expert -> Upgrade
    expect(screen.getByText("Current plan")).toBeInTheDocument();
    expect(screen.getByText("Upgrade")).toBeInTheDocument();
    expect(screen.getByText("Downgrade")).toBeInTheDocument();
});

it("invokes onSelectPlan with id and code", () => {
    const onSelect = jest.fn();
    render(
        <PlanPicker
            plans={plans}
            overview={overview}
            onSelectPlan={onSelect}
            disabled={false}
        />
    );
    fireEvent.click(screen.getByText("Upgrade"));
    expect(onSelect).toHaveBeenCalledWith(8, "EXPERT");
});
