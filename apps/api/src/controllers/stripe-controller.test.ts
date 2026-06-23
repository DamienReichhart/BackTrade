jest.mock("../services/stripe", () => ({
    stripeService: {
        getBillingOverview: jest.fn(),
        listInvoices: jest.fn(),
        previewPlanChange: jest.fn(),
        changePlan: jest.fn(),
        cancelSubscription: jest.fn(),
        resumeSubscription: jest.fn(),
    },
    webhookService: {},
}));

import type { Request, Response } from "express";
import stripeController from "./stripe-controller";
import { stripeService } from "../services/stripe";

const mocked = stripeService as unknown as {
    getBillingOverview: jest.Mock;
    listInvoices: jest.Mock;
    previewPlanChange: jest.Mock;
    changePlan: jest.Mock;
    cancelSubscription: jest.Mock;
    resumeSubscription: jest.Mock;
};

function mockRes(): Response {
    const res = {} as Response;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

const user = { id: 2, stripe_customer_id: "cus_123" };

beforeEach(() => jest.clearAllMocks());

describe("stripe controller billing endpoints", () => {
    it("getBillingOverview returns 200 with the service result", async () => {
        mocked.getBillingOverview.mockResolvedValue({ status: "free" });
        const req = { user } as unknown as Request;
        const res = mockRes();

        await stripeController.getBillingOverview(req, res);

        expect(mocked.getBillingOverview).toHaveBeenCalledWith(user);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ status: "free" });
    });

    it("changePlan validates planId and calls the service", async () => {
        mocked.changePlan.mockResolvedValue({ status: "active" });
        const req = { user, body: { planId: 8 } } as unknown as Request;
        const res = mockRes();

        await stripeController.changePlan(req, res);

        expect(mocked.changePlan).toHaveBeenCalledWith(user, 8);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("changePlan rejects an invalid planId", async () => {
        const req = { user, body: {} } as unknown as Request;
        const res = mockRes();

        await expect(stripeController.changePlan(req, res)).rejects.toThrow();
        expect(mocked.changePlan).not.toHaveBeenCalled();
    });

    it("cancelSubscription calls the service", async () => {
        mocked.cancelSubscription.mockResolvedValue({ status: "canceling" });
        const req = { user } as unknown as Request;
        const res = mockRes();

        await stripeController.cancelSubscription(req, res);

        expect(mocked.cancelSubscription).toHaveBeenCalledWith(user);
        expect(res.json).toHaveBeenCalledWith({ status: "canceling" });
    });
});
