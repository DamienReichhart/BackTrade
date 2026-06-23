import { render, screen } from "../../test-utils";
import { Plans } from "./Plans";
import type { BillingOverviewResponse } from "@backtrade/types";

const overview: BillingOverviewResponse = {
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
    paymentMethod: {
        brand: "visa",
        last4: "4242",
        expMonth: 12,
        expYear: 2030,
    },
};

jest.mock("./hooks/usePlansPageData", () => ({
    usePlansPageData: () => ({
        overview,
        invoices: [],
        isLoading: false,
        error: null,
    }),
}));
jest.mock("./hooks/usePlanQuota", () => ({
    usePlanQuota: () => ({ used: 2, max: 10, isLoading: false }),
}));
jest.mock("./hooks/useSubscriptionLifecycle", () => ({
    useSubscriptionLifecycle: () => ({
        resume: jest.fn(),
        isResuming: false,
    }),
}));
jest.mock("../../api/hooks/requests/plans", () => ({
    usePlans: () => ({ data: [], isLoading: false, error: null }),
}));
jest.mock("../../api/hooks/requests/stripe", () => ({
    useCreatePortalSession: () => ({ execute: jest.fn(), isLoading: false }),
    usePreviewPlanChange: () => ({ execute: jest.fn(), isLoading: false }),
    useChangePlan: () => ({ execute: jest.fn(), isLoading: false }),
    useCancelSubscription: () => ({ execute: jest.fn(), isLoading: false }),
    useCreateCheckoutSession: () => ({ execute: jest.fn(), isLoading: false }),
}));
jest.mock("../../hooks", () => ({
    useToast: () => ({
        success: jest.fn(),
        error: jest.fn(),
        info: jest.fn(),
        warning: jest.fn(),
        dismiss: jest.fn(),
    }),
}));

it("renders all sections for an active subscriber", () => {
    render(<Plans />);
    expect(screen.getByRole("heading", { name: /plans/i })).toBeInTheDocument();
    expect(screen.getByLabelText("Current plan")).toBeInTheDocument();
    expect(screen.getByLabelText("Change plan")).toBeInTheDocument();
    expect(screen.getByLabelText("Payment method")).toBeInTheDocument();
    expect(screen.getByLabelText("Invoices")).toBeInTheDocument();
});
