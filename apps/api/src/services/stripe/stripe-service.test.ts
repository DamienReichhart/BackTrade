jest.mock("../../libs/stripe", () => ({
    stripe: {
        subscriptions: { retrieve: jest.fn(), update: jest.fn() },
        invoices: { list: jest.fn(), createPreview: jest.fn() },
    },
}));

jest.mock("@backtrade/data", () => ({
    usersRepo: { updateUser: jest.fn() },
    plansRepo: { getPlanById: jest.fn() },
    subscriptionsRepo: { getActiveSubscriptionByUserId: jest.fn() },
}));

jest.mock("../../libs/cache", () => ({
    usersCacheRepo: { invalidateCachedUser: jest.fn() },
}));

import { stripe } from "../../libs/stripe";
import { plansRepo, subscriptionsRepo } from "@backtrade/data";
import stripeService, { deriveBillingStatus } from "./stripe-service";
import type { User } from "@backtrade/types";

const mockedStripe = stripe as unknown as {
    subscriptions: { retrieve: jest.Mock; update: jest.Mock };
    invoices: { list: jest.Mock; createPreview: jest.Mock };
};
const mockedPlans = plansRepo as unknown as { getPlanById: jest.Mock };
const mockedSubs = subscriptionsRepo as unknown as {
    getActiveSubscriptionByUserId: jest.Mock;
};

const freeUser = { id: 1, email: "a@b.co", stripe_customer_id: null } as User;
const paidUser = {
    id: 2,
    email: "c@d.co",
    stripe_customer_id: "cus_123",
} as User;

beforeEach(() => {
    jest.clearAllMocks();
});

describe("deriveBillingStatus", () => {
    it("maps past_due/unpaid to past_due", () => {
        expect(deriveBillingStatus("past_due", false)).toBe("past_due");
        expect(deriveBillingStatus("unpaid", false)).toBe("past_due");
    });
    it("maps cancel_at_period_end to canceling", () => {
        expect(deriveBillingStatus("active", true)).toBe("canceling");
    });
    it("maps active/trialing to active", () => {
        expect(deriveBillingStatus("active", false)).toBe("active");
        expect(deriveBillingStatus("trialing", false)).toBe("active");
    });
    it("maps everything else to free", () => {
        expect(deriveBillingStatus("canceled", false)).toBe("free");
    });
});

describe("getBillingOverview", () => {
    it("returns a Free view-model when the user has no customer id", async () => {
        const result = await stripeService.getBillingOverview(freeUser);
        expect(result.status).toBe("free");
        expect(result.plan.code).toBe("FREE");
        expect(result.nextCharge).toBeNull();
        expect(mockedStripe.subscriptions.retrieve).not.toHaveBeenCalled();
    });

    it("returns Free when the user has no active subscription", async () => {
        mockedSubs.getActiveSubscriptionByUserId.mockResolvedValue(null);
        const result = await stripeService.getBillingOverview(paidUser);
        expect(result.status).toBe("free");
    });

    it("builds an active overview from Stripe + DB", async () => {
        mockedSubs.getActiveSubscriptionByUserId.mockResolvedValue({
            id: 5,
            plan_id: 7,
            stripe_subscription_id: "sub_1",
        });
        mockedPlans.getPlanById.mockResolvedValue({
            id: 7,
            code: "TRADER",
            price: 19,
            currency: "EUR",
            max_active_sessions: 10,
        });
        mockedStripe.subscriptions.retrieve.mockResolvedValue({
            status: "active",
            cancel_at_period_end: false,
            items: { data: [{ current_period_end: 1_900_000_000 }] },
            default_payment_method: {
                card: {
                    brand: "visa",
                    last4: "4242",
                    exp_month: 12,
                    exp_year: 2030,
                },
            },
        });

        const result = await stripeService.getBillingOverview(paidUser);

        expect(result.status).toBe("active");
        expect(result.plan).toMatchObject({
            code: "TRADER",
            displayName: "Trader",
            price: 19,
            currency: "eur",
            maxActiveSessions: 10,
        });
        expect(result.paymentMethod).toEqual({
            brand: "visa",
            last4: "4242",
            expMonth: 12,
            expYear: 2030,
        });
        expect(result.nextCharge).toEqual({
            amount: 19,
            currency: "eur",
            date: new Date(1_900_000_000 * 1000).toISOString(),
        });
        expect(mockedStripe.subscriptions.retrieve).toHaveBeenCalledWith(
            "sub_1",
            { expand: ["default_payment_method"] }
        );
    });

    it("returns null nextCharge when canceling", async () => {
        mockedSubs.getActiveSubscriptionByUserId.mockResolvedValue({
            id: 5,
            plan_id: 7,
            stripe_subscription_id: "sub_1",
        });
        mockedPlans.getPlanById.mockResolvedValue({
            id: 7,
            code: "TRADER",
            price: 19,
            currency: "EUR",
            max_active_sessions: 10,
        });
        mockedStripe.subscriptions.retrieve.mockResolvedValue({
            status: "active",
            cancel_at_period_end: true,
            items: { data: [{ current_period_end: 1_900_000_000 }] },
            default_payment_method: null,
        });

        const result = await stripeService.getBillingOverview(paidUser);
        expect(result.status).toBe("canceling");
        expect(result.nextCharge).toBeNull();
        expect(result.paymentMethod).toBeNull();
    });
});

describe("listInvoices", () => {
    it("returns [] when the user has no customer id", async () => {
        expect(await stripeService.listInvoices(freeUser)).toEqual([]);
        expect(mockedStripe.invoices.list).not.toHaveBeenCalled();
    });

    it("maps Stripe invoices to view-models (major units)", async () => {
        mockedStripe.invoices.list.mockResolvedValue({
            data: [
                {
                    id: "in_1",
                    number: "BT-001",
                    created: 1_800_000_000,
                    amount_paid: 1900,
                    total: 1900,
                    currency: "eur",
                    status: "paid",
                    hosted_invoice_url: "https://pay/in_1",
                    invoice_pdf: "https://pdf/in_1",
                },
            ],
        });

        const result = await stripeService.listInvoices(paidUser);

        expect(result).toEqual([
            {
                id: "in_1",
                number: "BT-001",
                date: new Date(1_800_000_000 * 1000).toISOString(),
                amount: 19,
                currency: "eur",
                status: "paid",
                hostedUrl: "https://pay/in_1",
                pdfUrl: "https://pdf/in_1",
            },
        ]);
        expect(mockedStripe.invoices.list).toHaveBeenCalledWith({
            customer: "cus_123",
            limit: 24,
        });
    });
});

describe("previewPlanChange", () => {
    beforeEach(() => {
        mockedSubs.getActiveSubscriptionByUserId.mockResolvedValue({
            id: 5,
            plan_id: 7,
            stripe_subscription_id: "sub_1",
        });
        mockedPlans.getPlanById.mockImplementation((id: number) =>
            id === 7
                ? Promise.resolve({ id: 7, code: "TRADER", price: 19 })
                : Promise.resolve({
                      id: 8,
                      code: "EXPERT",
                      price: 49,
                      stripe_price_id: "price_expert",
                  })
        );
        mockedStripe.subscriptions.retrieve.mockResolvedValue({
            id: "sub_1",
            items: {
                data: [{ id: "si_1", current_period_end: 1_900_000_000 }],
            },
        });
    });

    it("previews an upgrade with proration", async () => {
        mockedStripe.invoices.createPreview.mockResolvedValue({
            currency: "eur",
            lines: {
                data: [
                    {
                        amount: 3000,
                        parent: {
                            subscription_item_details: { proration: true },
                        },
                    },
                    {
                        amount: 4900,
                        parent: {
                            subscription_item_details: { proration: false },
                        },
                    },
                ],
            },
        });

        const result = await stripeService.previewPlanChange(paidUser, 8);

        expect(result).toEqual({
            amountDueToday: 30,
            currency: "eur",
            nextChargeAmount: 49,
            nextChargeDate: new Date(1_900_000_000 * 1000).toISOString(),
            isUpgrade: true,
        });
        expect(mockedStripe.invoices.createPreview).toHaveBeenCalledWith({
            customer: "cus_123",
            subscription: "sub_1",
            subscription_details: {
                items: [{ id: "si_1", price: "price_expert" }],
                proration_behavior: "always_invoice",
            },
        });
    });

    it("rejects changing to the current plan", async () => {
        await expect(
            stripeService.previewPlanChange(paidUser, 7)
        ).rejects.toThrow("already on this plan");
    });
});

describe("changePlan / cancel / resume", () => {
    beforeEach(() => {
        mockedSubs.getActiveSubscriptionByUserId.mockResolvedValue({
            id: 5,
            plan_id: 7,
            stripe_subscription_id: "sub_1",
        });
        mockedPlans.getPlanById.mockImplementation((id: number) =>
            id === 7
                ? Promise.resolve({ id: 7, code: "TRADER", price: 19 })
                : Promise.resolve({
                      id: 8,
                      code: "EXPERT",
                      price: 49,
                      stripe_price_id: "price_expert",
                  })
        );
        mockedStripe.subscriptions.retrieve.mockResolvedValue({
            id: "sub_1",
            items: {
                data: [{ id: "si_1", current_period_end: 1_900_000_000 }],
            },
        });
    });

    it("changePlan updates the subscription item with always_invoice", async () => {
        mockedStripe.subscriptions.update.mockResolvedValue({
            status: "active",
            cancel_at_period_end: false,
            items: { data: [{ current_period_end: 1_900_000_000 }] },
        });

        const result = await stripeService.changePlan(paidUser, 8);

        expect(mockedStripe.subscriptions.update).toHaveBeenCalledWith("sub_1", {
            items: [{ id: "si_1", price: "price_expert" }],
            proration_behavior: "always_invoice",
        });
        expect(result.status).toBe("active");
        expect(result.cancelAtPeriodEnd).toBe(false);
    });

    it("cancelSubscription sets cancel_at_period_end true", async () => {
        mockedStripe.subscriptions.update.mockResolvedValue({
            status: "active",
            cancel_at_period_end: true,
            items: { data: [{ current_period_end: 1_900_000_000 }] },
        });

        const result = await stripeService.cancelSubscription(paidUser);

        expect(mockedStripe.subscriptions.update).toHaveBeenCalledWith("sub_1", {
            cancel_at_period_end: true,
        });
        expect(result.status).toBe("canceling");
        expect(result.cancelAtPeriodEnd).toBe(true);
    });

    it("resumeSubscription sets cancel_at_period_end false", async () => {
        mockedStripe.subscriptions.update.mockResolvedValue({
            status: "active",
            cancel_at_period_end: false,
            items: { data: [{ current_period_end: 1_900_000_000 }] },
        });

        const result = await stripeService.resumeSubscription(paidUser);

        expect(mockedStripe.subscriptions.update).toHaveBeenCalledWith("sub_1", {
            cancel_at_period_end: false,
        });
        expect(result.status).toBe("active");
    });

    it("cancel throws when there is no active subscription", async () => {
        mockedSubs.getActiveSubscriptionByUserId.mockResolvedValue(null);
        await expect(
            stripeService.cancelSubscription(paidUser)
        ).rejects.toThrow("No active subscription");
    });
});
