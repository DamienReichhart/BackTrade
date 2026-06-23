import { act, renderHook, waitFor } from "../../../test-utils";
import { usePlanChange } from "./usePlanChange";
import type { BillingOverviewResponse } from "@backtrade/types";
import * as stripeApi from "../../../api/hooks/requests/stripe";

jest.mock("../../../api/hooks/requests/stripe", () => ({
    usePreviewPlanChange: jest.fn(),
    useChangePlan: jest.fn(),
    useCancelSubscription: jest.fn(),
    useCreateCheckoutSession: jest.fn(),
}));
jest.mock("../../../hooks", () => ({
    useToast: () => ({
        success: jest.fn(),
        error: jest.fn(),
        info: jest.fn(),
        warning: jest.fn(),
        dismiss: jest.fn(),
    }),
}));

const previewExecute = jest.fn();
const changeExecute = jest.fn();
const cancelExecute = jest.fn();
const checkoutExecute = jest.fn();

beforeEach(() => {
    jest.clearAllMocks();
    (stripeApi.usePreviewPlanChange as jest.Mock).mockReturnValue({
        execute: previewExecute,
        isLoading: false,
    });
    (stripeApi.useChangePlan as jest.Mock).mockReturnValue({
        execute: changeExecute,
        isLoading: false,
    });
    (stripeApi.useCancelSubscription as jest.Mock).mockReturnValue({
        execute: cancelExecute,
        isLoading: false,
    });
    (stripeApi.useCreateCheckoutSession as jest.Mock).mockReturnValue({
        execute: checkoutExecute,
        isLoading: false,
    });
});

const traderOverview = {
    status: "active",
    plan: { code: "TRADER", price: 19, currency: "eur" },
    currentPeriodEnd: "2026-07-14T00:00:00.000Z",
} as unknown as BillingOverviewResponse;

it("opens a cancel dialog when switching to Free", () => {
    const { result } = renderHook(() => usePlanChange(traderOverview));

    act(() => result.current.selectPlan(1, "FREE"));

    expect(result.current.dialog).not.toBeNull();
    expect(result.current.dialog?.title.toLowerCase()).toContain("cancel");
});

it("opens a change dialog and fetches a preview for paid → paid", async () => {
    previewExecute.mockResolvedValue({
        amountDueToday: 30,
        currency: "eur",
        nextChargeAmount: 49,
        nextChargeDate: "2026-07-14T00:00:00.000Z",
        isUpgrade: true,
    });

    const { result } = renderHook(() => usePlanChange(traderOverview));

    act(() => result.current.selectPlan(8, "EXPERT"));
    expect(result.current.dialog).not.toBeNull();
    expect(previewExecute).toHaveBeenCalledWith({ planId: 8 });

    await waitFor(() =>
        expect(result.current.dialog?.message).toMatch(/today/i)
    );
});

it("redirects to checkout for Free → paid", async () => {
    checkoutExecute.mockResolvedValue({ url: "https://checkout/x" });
    const freeOverview = {
        status: "free",
        plan: { code: "FREE", price: 0, currency: "eur" },
        currentPeriodEnd: null,
    } as unknown as BillingOverviewResponse;

    const { result } = renderHook(() => usePlanChange(freeOverview));

    await act(async () => {
        result.current.selectPlan(8, "EXPERT");
    });

    expect(checkoutExecute).toHaveBeenCalledWith({ planId: 8 });
});
