import { render, screen } from "../../../../test-utils";
import { PlanSummary } from "./PlanSummary";
import type { BillingOverviewResponse } from "@backtrade/types";

jest.mock("../../hooks/usePlanQuota", () => ({
    usePlanQuota: () => ({ used: 3, max: 10, isLoading: false }),
}));

const base: BillingOverviewResponse = {
    status: "active",
    plan: {
        code: "TRADER",
        displayName: "Trader",
        price: 19,
        currency: "eur",
        maxActiveSessions: 10,
    },
    currentPeriodEnd: "2026-07-14T00:00:00.000Z",
    cancelAtPeriodEnd: false,
    nextCharge: {
        amount: 19,
        currency: "eur",
        date: "2026-07-14T00:00:00.000Z",
    },
    paymentMethod: null,
};

const noop = () => undefined;

function renderSummary(overview: BillingOverviewResponse) {
    return render(
        <PlanSummary
            overview={overview}
            onChangePlan={noop}
            onCancel={noop}
            onResume={noop}
            onUpdatePayment={noop}
            isBusy={false}
        />
    );
}

it("shows the plan name, quota, and Change/Cancel for active plans", () => {
    renderSummary(base);
    expect(screen.getByText("Trader")).toBeInTheDocument();
    expect(screen.getByText(/3\s*\/\s*10/)).toBeInTheDocument();
    expect(
        screen.getByRole("button", { name: /change plan/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
});

it("shows Resume when canceling", () => {
    renderSummary({ ...base, status: "canceling", cancelAtPeriodEnd: true });
    expect(screen.getByRole("button", { name: /resume/i })).toBeInTheDocument();
});

it("shows Upgrade for free users", () => {
    renderSummary({
        ...base,
        status: "free",
        plan: { ...base.plan, code: "FREE", displayName: "Free", price: 0 },
        nextCharge: null,
    });
    expect(
        screen.getByRole("button", { name: /upgrade/i })
    ).toBeInTheDocument();
});
