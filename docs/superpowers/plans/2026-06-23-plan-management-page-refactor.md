# Plan Management Page Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the logged-in `/dashboard/plans` page into a self-sufficient subscription page with live Stripe billing data, in-app upgrade/downgrade (with proration preview), cancel/resume, payment method, and invoices.

**Architecture:** Live Stripe passthrough — new thin backend endpoints under `/api/v1/stripe` call Stripe on demand and return clean view-models; the existing `customer.subscription.updated` webhook still reconciles the local DB. The frontend feature module is rebuilt around React Query data hooks, a small set of focused components, and the existing `ConfirmModal` driven by a `usePlanChange` state machine.

**Tech Stack:** Express + Zod + Stripe SDK (`2026-05-27.dahlia`) on the backend; React 18 + React Query + Zustand + CSS Modules on the frontend; Jest (ts-jest) on both; shared Zod schemas in `@backtrade/types`.

## Global Constraints

- **TypeScript strict mode, no `any`.** Use typed assertions, never `any`. Interface names PascalCase.
- **Frontend API calls** go through `useGet`/`usePost` with explicit Zod `inputSchema`/`outputSchema` from `@backtrade/types`. Never call `fetch` directly.
- **CSS uses design-token variables only** (`var(--color-…)`, `var(--spacing-…)`, `var(--radius-…)`, `var(--font-size-…)`, `var(--font-weight-…)`, `var(--shadow-…)`, `var(--transition-…)`). No hardcoded hex/px. Dynamic data-driven widths (e.g. a quota bar percentage) via inline `style` are allowed.
- **Components**: each in its own directory (`Name/Name.tsx` + `Name.module.css` + `index.tsx`), named export, CSS Modules via `styles.*`. Hooks export through `hooks/index.tsx`; utils through `utils/index.ts`.
- **`@backtrade/data` is firewalled** — data access only. Business logic lives in `apps/api/src/services/`.
- **Stripe amounts are integers in the smallest currency unit (cents).** Divide by 100 before returning major-unit numbers; Stripe `currency` is a lowercase 3-letter code (e.g. `"eur"`).
- **Conventional Commits enforced**: `<type>(<scope>): <subject>` — type and scope both required, subject lowercase imperative, no trailing period. Scopes: `api`, `web`, `types`. **Do NOT add a `Co-Authored-By` trailer.**
- **Verification**: run on the host with pnpm — `pnpm --filter <pkg> typecheck`, `lint`, `test`. Docker is often down; the pre-commit hook may not be installed, so run checks manually before each commit.
- Run a single test file: `pnpm --filter @backtrade/api test -- <pattern>` / `pnpm --filter @backtrade/web test -- <pattern>`.
- After editing `@backtrade/types`, run `pnpm --filter @backtrade/types build` so `apps/api` and `apps/web` resolve the new exports.

---

## File Structure

**Created:**
- `apps/web/src/config/plans.tsx` — shared plan-presentation config (display name, tagline, features, tierRank, recommended).
- `apps/web/src/test-utils.tsx` — Testing Library render helper wrapping providers.
- `apps/web/src/features/plans/hooks/usePlansPageData.tsx` — aggregates billing overview + invoices.
- `apps/web/src/features/plans/hooks/usePlanQuota.tsx` — active-session count vs. plan max.
- `apps/web/src/features/plans/hooks/useSubscriptionLifecycle.tsx` — cancel / resume.
- `apps/web/src/features/plans/hooks/usePlanChange.tsx` — plan-change state machine + dialog props.
- `apps/web/src/features/plans/utils/plan.ts`, `utils/billing.ts`, `utils/sessions.ts`, `utils/index.ts`.
- `apps/web/src/features/plans/components/PlanSummary/{PlanSummary.tsx,PlanSummary.module.css,index.tsx}`.
- `apps/web/src/features/plans/components/PlanPicker/{PlanPicker.tsx,PlanPicker.module.css,index.tsx}`.
- `apps/web/src/features/plans/components/PlanPicker/PlanOptionCard/{PlanOptionCard.tsx,PlanOptionCard.module.css,index.tsx}`.
- `apps/web/src/features/plans/components/PaymentMethod/{PaymentMethod.tsx,PaymentMethod.module.css,index.tsx}`.
- `apps/web/src/features/plans/components/InvoiceList/{InvoiceList.tsx,InvoiceList.module.css,index.tsx}`.
- `apps/web/src/features/plans/components/InvoiceList/InvoiceRow/{InvoiceRow.tsx,InvoiceRow.module.css,index.tsx}`.

**Modified:**
- `packages/types/src/requests/stripe.ts` — new schemas.
- `apps/api/src/services/stripe/stripe-service.ts` — new service methods + helpers.
- `apps/api/src/controllers/stripe-controller.ts` — new controller methods.
- `apps/api/src/routes/v1/stripe/router.ts` — new routes.
- `apps/web/src/api/hooks/requests/stripe.tsx` — new request hooks.
- `apps/web/src/features/plans/Plans.tsx` + `Plans.module.css` — rebuilt.
- `apps/web/src/features/plans/hooks/index.tsx`, `components/index.tsx`.
- `apps/web/src/features/pricing/config/pricingConfig.tsx` — feature lists sourced from the shared config.

**Deleted:**
- `apps/web/src/features/plans/components/CurrentSubscription/` (whole dir)
- `apps/web/src/features/plans/components/SubscriptionList/` (whole dir)
- `apps/web/src/features/plans/components/SubscriptionCard/` (whole dir)
- `apps/web/src/features/plans/components/PlanCard/` (whole dir)
- `apps/web/src/features/plans/components/PlanList/` (whole dir)
- `apps/web/src/features/plans/hooks/usePlansData.tsx`
- `apps/web/src/features/plans/hooks/useSubscriptionManagement.tsx`
- `apps/web/src/features/plans/utils/subscriptions.ts` (replaced by `utils/billing.ts`)

**Kept untouched:** `apps/web/src/features/plans/components/PurchaseSuccess/`.

---

## Phase 1 — Shared types

### Task 1: Add Stripe billing/subscription-management schemas

**Files:**
- Modify: `packages/types/src/requests/stripe.ts`

**Interfaces:**
- Produces (all exported from `@backtrade/types`):
  - `BillingStatusSchema` / `BillingStatus` = `"free" | "active" | "canceling" | "past_due"`
  - `BillingOverviewResponseSchema` / `BillingOverviewResponse`
  - `InvoiceSchema`, `InvoiceListResponseSchema` / `InvoiceListResponse`
  - `PlanChangePreviewRequestSchema`, `PlanChangePreviewResponseSchema` / `PlanChangePreviewResponse`
  - `ChangePlanRequestSchema`, `SubscriptionActionResponseSchema` / `SubscriptionActionResponse`

- [ ] **Step 1: Append the new schemas to the file**

Append to `packages/types/src/requests/stripe.ts` (after the existing exports):

```typescript
/**
 * Derived, user-facing subscription status.
 */
export const BillingStatusSchema = z.enum([
    "free",
    "active",
    "canceling",
    "past_due",
]);
export type BillingStatus = z.infer<typeof BillingStatusSchema>;

/**
 * The plan portion of the billing overview (major currency units).
 */
export const BillingOverviewPlanSchema = z.object({
    code: z.string(),
    displayName: z.string(),
    price: z.number(),
    currency: z.string(),
    maxActiveSessions: z.number().int().positive(),
});
export type BillingOverviewPlan = z.infer<typeof BillingOverviewPlanSchema>;

export const BillingPaymentMethodSchema = z.object({
    brand: z.string(),
    last4: z.string(),
    expMonth: z.number().int(),
    expYear: z.number().int(),
});
export type BillingPaymentMethod = z.infer<typeof BillingPaymentMethodSchema>;

export const BillingNextChargeSchema = z.object({
    amount: z.number(),
    currency: z.string(),
    date: z.string(),
});
export type BillingNextCharge = z.infer<typeof BillingNextChargeSchema>;

/**
 * Aggregated billing overview returned by GET /stripe/billing.
 */
export const BillingOverviewResponseSchema = z.object({
    status: BillingStatusSchema,
    plan: BillingOverviewPlanSchema,
    currentPeriodEnd: z.string().nullable(),
    cancelAtPeriodEnd: z.boolean(),
    nextCharge: BillingNextChargeSchema.nullable(),
    paymentMethod: BillingPaymentMethodSchema.nullable(),
});
export type BillingOverviewResponse = z.infer<
    typeof BillingOverviewResponseSchema
>;

/**
 * A single invoice (amount in major currency units).
 */
export const InvoiceSchema = z.object({
    id: z.string(),
    number: z.string().nullable(),
    date: z.string(),
    amount: z.number(),
    currency: z.string(),
    status: z.string(),
    hostedUrl: z.string().nullable(),
    pdfUrl: z.string().nullable(),
});
export type Invoice = z.infer<typeof InvoiceSchema>;

export const InvoiceListResponseSchema = z.array(InvoiceSchema);
export type InvoiceListResponse = z.infer<typeof InvoiceListResponseSchema>;

/**
 * Proration preview for a plan change.
 */
export const PlanChangePreviewRequestSchema = z.object({
    planId: z.number().int().positive(),
});
export type PlanChangePreviewRequest = z.infer<
    typeof PlanChangePreviewRequestSchema
>;

export const PlanChangePreviewResponseSchema = z.object({
    amountDueToday: z.number(),
    currency: z.string(),
    nextChargeAmount: z.number(),
    nextChargeDate: z.string(),
    isUpgrade: z.boolean(),
});
export type PlanChangePreviewResponse = z.infer<
    typeof PlanChangePreviewResponseSchema
>;

/**
 * Apply a plan change.
 */
export const ChangePlanRequestSchema = z.object({
    planId: z.number().int().positive(),
});
export type ChangePlanRequest = z.infer<typeof ChangePlanRequestSchema>;

/**
 * Returned by change/cancel/resume actions.
 */
export const SubscriptionActionResponseSchema = z.object({
    status: BillingStatusSchema,
    cancelAtPeriodEnd: z.boolean(),
    currentPeriodEnd: z.string().nullable(),
});
export type SubscriptionActionResponse = z.infer<
    typeof SubscriptionActionResponseSchema
>;
```

- [ ] **Step 2: Confirm these are re-exported from the package root**

Check `packages/types/src/requests/index.ts` (or equivalent barrel) re-exports `./stripe`. The existing `CreateCheckoutSessionRequestSchema` is already importable from `@backtrade/types`, so `./stripe` is already barreled — no change needed. Verify by grep:

Run: `grep -rn "stripe" packages/types/src/requests/index.ts packages/types/src/index.ts`
Expected: a line re-exporting the stripe requests module.

- [ ] **Step 3: Build the package**

Run: `pnpm --filter @backtrade/types build`
Expected: success, no TypeScript errors.

- [ ] **Step 4: Typecheck**

Run: `pnpm --filter @backtrade/types typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/types/src/requests/stripe.ts
git commit -m "feat(types): add billing overview, invoices, and plan-change schemas"
```

---

## Phase 2 — Backend service

> All backend tests mock `../../libs/stripe` and the `@backtrade/data` repositories. Build types first (Task 1 Step 3) so `@backtrade/types` resolves in `apps/api`.

### Task 2: `getBillingOverview` + billing-status helper

**Files:**
- Modify: `apps/api/src/services/stripe/stripe-service.ts`
- Test: `apps/api/src/services/stripe/stripe-service.test.ts` (create)

**Interfaces:**
- Produces:
  - `deriveBillingStatus(stripeStatus: string, cancelAtPeriodEnd: boolean): BillingStatus` (module-level export)
  - `StripeService.getBillingOverview(user: User): Promise<BillingOverviewResponse>`

- [ ] **Step 1: Write the failing test**

Create `apps/api/src/services/stripe/stripe-service.test.ts`:

```typescript
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @backtrade/api test -- stripe-service.test`
Expected: FAIL — `deriveBillingStatus` / `getBillingOverview` not exported.

- [ ] **Step 3: Implement the helper and method**

Edit `apps/api/src/services/stripe/stripe-service.ts`. Update the imports at the top:

```typescript
import { stripe } from "../../libs/stripe";
import { usersRepo, plansRepo, subscriptionsRepo } from "@backtrade/data";
import { usersCacheRepo } from "../../libs/cache";
import type { User, BillingOverviewResponse } from "@backtrade/types";
import {
    getPricingTierCodeDisplayLabel,
    type PricingTierCode,
} from "@backtrade/types";
import type Stripe from "stripe";
import { BaseService } from "../base/base-service";
import NotFoundError from "../../errors/web/not-found-error";
import BadRequestError from "../../errors/web/bad-request-error";
import { ENV } from "../../config/env";
```

Add these module-level helpers above the `class StripeService` declaration:

```typescript
type BillingStatusValue = BillingOverviewResponse["status"];

/**
 * Map a raw Stripe subscription status + cancel flag to a user-facing status.
 */
export function deriveBillingStatus(
    stripeStatus: string,
    cancelAtPeriodEnd: boolean
): BillingStatusValue {
    if (stripeStatus === "past_due" || stripeStatus === "unpaid") {
        return "past_due";
    }
    if (cancelAtPeriodEnd) return "canceling";
    if (stripeStatus === "active" || stripeStatus === "trialing") {
        return "active";
    }
    return "free";
}

/**
 * Extract a display card from an (expanded) payment method, if present.
 */
function extractCard(
    pm: string | Stripe.PaymentMethod | null | undefined
): BillingOverviewResponse["paymentMethod"] {
    if (!pm || typeof pm === "string" || !pm.card) return null;
    return {
        brand: pm.card.brand,
        last4: pm.card.last4,
        expMonth: pm.card.exp_month,
        expYear: pm.card.exp_year,
    };
}

/**
 * Period end (epoch seconds) lives on the first subscription item.
 */
function periodEndIso(sub: Stripe.Subscription): string | null {
    const end = sub.items.data[0]?.current_period_end ?? null;
    return end ? new Date(end * 1000).toISOString() : null;
}

const FREE_OVERVIEW: BillingOverviewResponse = {
    status: "free",
    plan: {
        code: "FREE",
        displayName: "Free",
        price: 0,
        currency: "eur",
        maxActiveSessions: 1,
    },
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    nextCharge: null,
    paymentMethod: null,
};
```

Add the method inside the `StripeService` class (after `getCheckoutSession`):

```typescript
    /**
     * Aggregated billing overview for the plan management page.
     */
    async getBillingOverview(user: User): Promise<BillingOverviewResponse> {
        if (!user.stripe_customer_id) return FREE_OVERVIEW;

        const subscription = await subscriptionsRepo.getActiveSubscriptionByUserId(
            user.id
        );
        if (!subscription) return FREE_OVERVIEW;

        const plan = await plansRepo.getPlanById(subscription.plan_id);
        if (!plan) return FREE_OVERVIEW;

        const stripeSub = await stripe.subscriptions.retrieve(
            subscription.stripe_subscription_id,
            { expand: ["default_payment_method"] }
        );

        const status = deriveBillingStatus(
            stripeSub.status,
            stripeSub.cancel_at_period_end
        );
        const currentPeriodEnd = periodEndIso(stripeSub);
        const currency = plan.currency.toLowerCase();
        const price = Number(plan.price);

        return {
            status,
            plan: {
                code: plan.code,
                displayName: getPricingTierCodeDisplayLabel(
                    plan.code as PricingTierCode
                ),
                price,
                currency,
                maxActiveSessions: plan.max_active_sessions,
            },
            currentPeriodEnd,
            cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
            nextCharge:
                status === "active" && currentPeriodEnd
                    ? { amount: price, currency, date: currentPeriodEnd }
                    : null,
            paymentMethod: extractCard(
                stripeSub.default_payment_method as
                    | string
                    | Stripe.PaymentMethod
                    | null
            ),
        };
    }
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm --filter @backtrade/api test -- stripe-service.test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/services/stripe/stripe-service.ts apps/api/src/services/stripe/stripe-service.test.ts
git commit -m "feat(api): add billing overview to stripe service"
```

---

### Task 3: `listInvoices`

**Files:**
- Modify: `apps/api/src/services/stripe/stripe-service.ts`
- Test: `apps/api/src/services/stripe/stripe-service.test.ts`

**Interfaces:**
- Produces: `StripeService.listInvoices(user: User): Promise<InvoiceListResponse>`

- [ ] **Step 1: Add the failing test**

Append to `stripe-service.test.ts`:

```typescript
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @backtrade/api test -- stripe-service.test`
Expected: FAIL — `listInvoices` not a function.

- [ ] **Step 3: Implement**

Add to the imports' type list: `BillingOverviewResponse, InvoiceListResponse`:

```typescript
import type {
    User,
    BillingOverviewResponse,
    InvoiceListResponse,
} from "@backtrade/types";
```

Add the method inside `StripeService`:

```typescript
    /**
     * Recent invoices for the user, newest first.
     */
    async listInvoices(user: User): Promise<InvoiceListResponse> {
        if (!user.stripe_customer_id) return [];

        const invoices = await stripe.invoices.list({
            customer: user.stripe_customer_id,
            limit: 24,
        });

        return invoices.data.map((inv) => ({
            id: inv.id ?? "",
            number: inv.number ?? null,
            date: new Date(inv.created * 1000).toISOString(),
            amount: (inv.amount_paid || inv.total || 0) / 100,
            currency: inv.currency,
            status: inv.status ?? "unknown",
            hostedUrl: inv.hosted_invoice_url ?? null,
            pdfUrl: inv.invoice_pdf ?? null,
        }));
    }
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm --filter @backtrade/api test -- stripe-service.test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/services/stripe/stripe-service.ts apps/api/src/services/stripe/stripe-service.test.ts
git commit -m "feat(api): list customer invoices in stripe service"
```

---

### Task 4: `previewPlanChange` + `requirePaidChange` helper

**Files:**
- Modify: `apps/api/src/services/stripe/stripe-service.ts`
- Test: `apps/api/src/services/stripe/stripe-service.test.ts`

**Interfaces:**
- Produces: `StripeService.previewPlanChange(user: User, planId: number): Promise<PlanChangePreviewResponse>`
- Consumes: `subscriptionsRepo.getActiveSubscriptionByUserId`, `plansRepo.getPlanById`, `stripe.subscriptions.retrieve`, `stripe.invoices.createPreview`.

> **Verification note:** Stripe (API `2026-05-27.dahlia`) marks proration lines via `line.parent.subscription_item_details.proration === true` (per `invoices.createPreview` docs). The implementation isolates this in `sumProrationLines`; if a Stripe test-mode preview shows a different line shape, adjust only that helper.

- [ ] **Step 1: Add the failing test**

Append to `stripe-service.test.ts`:

```typescript
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @backtrade/api test -- stripe-service.test`
Expected: FAIL — `previewPlanChange` not a function.

- [ ] **Step 3: Implement**

Add to the type imports: `PlanChangePreviewResponse`. Add a `Plan` type import for the helper return:

```typescript
import type {
    User,
    Plan,
    BillingOverviewResponse,
    InvoiceListResponse,
    PlanChangePreviewResponse,
} from "@backtrade/types";
```

Add this module-level helper (near the other helpers):

```typescript
interface ProrationParent {
    subscription_item_details?: { proration?: boolean };
}

/**
 * Sum the proration line items (in cents) from a preview invoice.
 */
function sumProrationLines(preview: Stripe.Invoice): number {
    return preview.lines.data.reduce((total, line) => {
        const parent = line.parent as ProrationParent | null | undefined;
        return parent?.subscription_item_details?.proration === true
            ? total + line.amount
            : total;
    }, 0);
}
```

Add the private helper and the method inside `StripeService`:

```typescript
    /**
     * Resolve and validate a paid-to-paid plan change for the user.
     */
    private async requirePaidChange(
        user: User,
        planId: number
    ): Promise<{
        stripeSub: Stripe.Subscription;
        currentPlan: Plan;
        targetPlan: Plan;
        customerId: string;
    }> {
        if (!user.stripe_customer_id) {
            throw new BadRequestError("No active subscription to change.");
        }
        const subscription =
            await subscriptionsRepo.getActiveSubscriptionByUserId(user.id);
        if (!subscription) {
            throw new BadRequestError("No active subscription to change.");
        }
        const currentPlan = await plansRepo.getPlanById(subscription.plan_id);
        const targetPlan = await plansRepo.getPlanById(planId);
        if (!targetPlan?.stripe_price_id) {
            throw new NotFoundError("Plan not found or invalid configuration");
        }
        if (!currentPlan) {
            throw new NotFoundError("Current plan not found");
        }
        if (targetPlan.id === currentPlan.id) {
            throw new BadRequestError("You are already on this plan.");
        }
        const stripeSub = await stripe.subscriptions.retrieve(
            subscription.stripe_subscription_id
        );
        if (!stripeSub.items.data[0]) {
            throw new BadRequestError("Subscription has no items.");
        }
        return {
            stripeSub,
            currentPlan,
            targetPlan,
            customerId: user.stripe_customer_id,
        };
    }

    /**
     * Preview the proration for switching to a paid plan.
     */
    async previewPlanChange(
        user: User,
        planId: number
    ): Promise<PlanChangePreviewResponse> {
        const { stripeSub, currentPlan, targetPlan, customerId } =
            await this.requirePaidChange(user, planId);

        const itemId = stripeSub.items.data[0].id;
        const preview = await stripe.invoices.createPreview({
            customer: customerId,
            subscription: stripeSub.id,
            subscription_details: {
                items: [{ id: itemId, price: targetPlan.stripe_price_id }],
                proration_behavior: "always_invoice",
            },
        });

        return {
            amountDueToday: sumProrationLines(preview) / 100,
            currency: preview.currency,
            nextChargeAmount: Number(targetPlan.price),
            nextChargeDate: periodEndIso(stripeSub) ?? "",
            isUpgrade: Number(targetPlan.price) > Number(currentPlan.price),
        };
    }
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm --filter @backtrade/api test -- stripe-service.test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/services/stripe/stripe-service.ts apps/api/src/services/stripe/stripe-service.test.ts
git commit -m "feat(api): preview plan-change proration in stripe service"
```

---

### Task 5: `changePlan`, `cancelSubscription`, `resumeSubscription`

**Files:**
- Modify: `apps/api/src/services/stripe/stripe-service.ts`
- Test: `apps/api/src/services/stripe/stripe-service.test.ts`

**Interfaces:**
- Produces:
  - `StripeService.changePlan(user, planId): Promise<SubscriptionActionResponse>`
  - `StripeService.cancelSubscription(user): Promise<SubscriptionActionResponse>`
  - `StripeService.resumeSubscription(user): Promise<SubscriptionActionResponse>`

- [ ] **Step 1: Add the failing test**

Append to `stripe-service.test.ts`:

```typescript
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @backtrade/api test -- stripe-service.test`
Expected: FAIL — methods not defined.

- [ ] **Step 3: Implement**

Add to the type imports: `SubscriptionActionResponse`. Add this module helper near the others:

```typescript
function toActionResponse(
    sub: Stripe.Subscription
): SubscriptionActionResponse {
    return {
        status: deriveBillingStatus(sub.status, sub.cancel_at_period_end),
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        currentPeriodEnd: periodEndIso(sub),
    };
}
```

Add the methods inside `StripeService`:

```typescript
    /**
     * Switch to a different paid plan immediately with proration.
     */
    async changePlan(
        user: User,
        planId: number
    ): Promise<SubscriptionActionResponse> {
        const { stripeSub, targetPlan } = await this.requirePaidChange(
            user,
            planId
        );
        const itemId = stripeSub.items.data[0].id;
        const updated = await stripe.subscriptions.update(stripeSub.id, {
            items: [{ id: itemId, price: targetPlan.stripe_price_id }],
            proration_behavior: "always_invoice",
        });
        return toActionResponse(updated);
    }

    /**
     * Resolve the user's active Stripe subscription or throw.
     */
    private async requireActiveStripeSub(
        user: User
    ): Promise<Stripe.Subscription> {
        if (!user.stripe_customer_id) {
            throw new BadRequestError("No active subscription found.");
        }
        const subscription =
            await subscriptionsRepo.getActiveSubscriptionByUserId(user.id);
        if (!subscription) {
            throw new BadRequestError("No active subscription found.");
        }
        return stripe.subscriptions.retrieve(
            subscription.stripe_subscription_id
        );
    }

    /**
     * Schedule cancellation at the end of the current period.
     */
    async cancelSubscription(
        user: User
    ): Promise<SubscriptionActionResponse> {
        const stripeSub = await this.requireActiveStripeSub(user);
        const updated = await stripe.subscriptions.update(stripeSub.id, {
            cancel_at_period_end: true,
        });
        return toActionResponse(updated);
    }

    /**
     * Undo a scheduled cancellation.
     */
    async resumeSubscription(
        user: User
    ): Promise<SubscriptionActionResponse> {
        const stripeSub = await this.requireActiveStripeSub(user);
        const updated = await stripe.subscriptions.update(stripeSub.id, {
            cancel_at_period_end: false,
        });
        return toActionResponse(updated);
    }
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm --filter @backtrade/api test -- stripe-service.test`
Expected: PASS (all describe blocks green).

- [ ] **Step 5: Typecheck**

Run: `pnpm --filter @backtrade/api typecheck`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/services/stripe/stripe-service.ts apps/api/src/services/stripe/stripe-service.test.ts
git commit -m "feat(api): change, cancel, and resume subscriptions in stripe service"
```

---

## Phase 3 — Backend controller + routes

### Task 6: Controller methods + routes for the 6 endpoints

**Files:**
- Modify: `apps/api/src/controllers/stripe-controller.ts`
- Modify: `apps/api/src/routes/v1/stripe/router.ts`
- Test: `apps/api/src/controllers/stripe-controller.test.ts` (create)

**Interfaces:**
- Produces (controller methods, all `(req, res) => Promise<void>`): `getBillingOverview`, `listInvoices`, `previewPlanChange`, `changePlan`, `cancelSubscription`, `resumeSubscription`.
- Routes (all `authMiddleware`): `GET /stripe/billing`, `GET /stripe/invoices`, `POST /stripe/subscription/preview`, `POST /stripe/subscription/change`, `POST /stripe/subscription/cancel`, `POST /stripe/subscription/resume`.

- [ ] **Step 1: Write the failing test**

Create `apps/api/src/controllers/stripe-controller.test.ts`:

```typescript
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

const mocked = stripeService as unknown as Record<string, jest.Mock>;

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

        await expect(
            stripeController.changePlan(req, res)
        ).rejects.toThrow();
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @backtrade/api test -- stripe-controller.test`
Expected: FAIL — methods not defined.

- [ ] **Step 3: Implement the controller methods**

In `apps/api/src/controllers/stripe-controller.ts`, update the imports:

```typescript
import {
    SessionIdParamsSchema,
    ChangePlanRequestSchema,
    PlanChangePreviewRequestSchema,
} from "@backtrade/types";
```

Add these methods inside `StripeController` (after `getCheckoutSession`, before `handleWebhook`):

```typescript
    /**
     * GET /stripe/billing
     */
    async getBillingOverview(req: Request, res: Response): Promise<void> {
        const user = req.user!;
        const overview = await stripeService.getBillingOverview(user);
        res.status(200).json(overview);
    }

    /**
     * GET /stripe/invoices
     */
    async listInvoices(req: Request, res: Response): Promise<void> {
        const user = req.user!;
        const invoices = await stripeService.listInvoices(user);
        res.status(200).json(invoices);
    }

    /**
     * POST /stripe/subscription/preview
     */
    async previewPlanChange(req: Request, res: Response): Promise<void> {
        const user = req.user!;
        let planId: number;
        try {
            ({ planId } = PlanChangePreviewRequestSchema.parse(req.body));
        } catch {
            throw new BadRequestError("A valid planId is required");
        }
        const preview = await stripeService.previewPlanChange(user, planId);
        res.status(200).json(preview);
    }

    /**
     * POST /stripe/subscription/change
     */
    async changePlan(req: Request, res: Response): Promise<void> {
        const user = req.user!;
        let planId: number;
        try {
            ({ planId } = ChangePlanRequestSchema.parse(req.body));
        } catch {
            throw new BadRequestError("A valid planId is required");
        }
        const result = await stripeService.changePlan(user, planId);
        res.status(200).json(result);
    }

    /**
     * POST /stripe/subscription/cancel
     */
    async cancelSubscription(req: Request, res: Response): Promise<void> {
        const user = req.user!;
        const result = await stripeService.cancelSubscription(user);
        res.status(200).json(result);
    }

    /**
     * POST /stripe/subscription/resume
     */
    async resumeSubscription(req: Request, res: Response): Promise<void> {
        const user = req.user!;
        const result = await stripeService.resumeSubscription(user);
        res.status(200).json(result);
    }
```

- [ ] **Step 4: Run the controller test to verify it passes**

Run: `pnpm --filter @backtrade/api test -- stripe-controller.test`
Expected: PASS.

- [ ] **Step 5: Wire the routes**

In `apps/api/src/routes/v1/stripe/router.ts`, add before `export default stripeRouter;`:

```typescript
/**
 * Billing overview
 * GET /api/v1/stripe/billing
 */
stripeRouter.get(
    "/billing",
    authMiddleware,
    stripeController.getBillingOverview.bind(stripeController)
);

/**
 * Invoices
 * GET /api/v1/stripe/invoices
 */
stripeRouter.get(
    "/invoices",
    authMiddleware,
    stripeController.listInvoices.bind(stripeController)
);

/**
 * Preview a plan change (proration)
 * POST /api/v1/stripe/subscription/preview
 */
stripeRouter.post(
    "/subscription/preview",
    authMiddleware,
    stripeController.previewPlanChange.bind(stripeController)
);

/**
 * Apply a plan change
 * POST /api/v1/stripe/subscription/change
 */
stripeRouter.post(
    "/subscription/change",
    authMiddleware,
    stripeController.changePlan.bind(stripeController)
);

/**
 * Cancel at period end
 * POST /api/v1/stripe/subscription/cancel
 */
stripeRouter.post(
    "/subscription/cancel",
    authMiddleware,
    stripeController.cancelSubscription.bind(stripeController)
);

/**
 * Resume (undo scheduled cancellation)
 * POST /api/v1/stripe/subscription/resume
 */
stripeRouter.post(
    "/subscription/resume",
    authMiddleware,
    stripeController.resumeSubscription.bind(stripeController)
);
```

- [ ] **Step 6: Typecheck the whole API**

Run: `pnpm --filter @backtrade/api typecheck`
Expected: PASS.

- [ ] **Step 7: Lint**

Run: `pnpm --filter @backtrade/api lint`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add apps/api/src/controllers/stripe-controller.ts apps/api/src/controllers/stripe-controller.test.ts apps/api/src/routes/v1/stripe/router.ts
git commit -m "feat(api): expose billing, invoices, and subscription action routes"
```

---

## Phase 4 — Shared plan presentation config

### Task 7: Create the shared plan-presentation config and dedupe pricing

**Files:**
- Create: `apps/web/src/config/plans.tsx`
- Modify: `apps/web/src/features/pricing/config/pricingConfig.tsx`
- Test: `apps/web/src/config/plans.test.ts` (create)

**Interfaces:**
- Produces:
  - `PLAN_PRESENTATION: Record<PricingTierCode, PlanPresentation>`
  - `getPlanPresentation(code: string): PlanPresentation`
  - `getTierRank(code: string): number`
  - `interface PlanPresentation { code: PricingTierCode; displayName: string; tagline: string; features: string[]; tierRank: number; recommended: boolean }`

- [ ] **Step 1: Write the failing test**

Create `apps/web/src/config/plans.test.ts`:

```typescript
import {
    getPlanPresentation,
    getTierRank,
    PLAN_PRESENTATION,
} from "./plans";

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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @backtrade/web test -- config/plans.test`
Expected: FAIL — module not found.

- [ ] **Step 3: Create the config**

Create `apps/web/src/config/plans.tsx`:

```tsx
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
    return (
        PLAN_PRESENTATION[code as PricingTierCode] ?? PLAN_PRESENTATION.FREE
    );
}

/**
 * Numeric tier rank used to label upgrades vs. downgrades.
 */
export function getTierRank(code: string): number {
    return getPlanPresentation(code).tierRank;
}
```

- [ ] **Step 4: Dedupe the marketing pricing feature lists**

In `apps/web/src/features/pricing/config/pricingConfig.tsx`, import the shared config and replace each tier's hardcoded `features` array with mapped values. Add at the top:

```tsx
import { PLAN_PRESENTATION } from "../../../config/plans";
```

Replace the three `features: [...]` arrays with:

```tsx
// FREE tier:
        features: PLAN_PRESENTATION.FREE.features.map((text) => ({
            text,
            included: true,
        })),
// TRADER tier:
        features: PLAN_PRESENTATION.TRADER.features.map((text) => ({
            text,
            included: true,
        })),
// EXPERT tier:
        features: PLAN_PRESENTATION.EXPERT.features.map((text) => ({
            text,
            included: true,
        })),
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `pnpm --filter @backtrade/web test -- config/plans.test`
Expected: PASS.

- [ ] **Step 6: Typecheck**

Run: `pnpm --filter @backtrade/web typecheck`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/config/plans.tsx apps/web/src/config/plans.test.ts apps/web/src/features/pricing/config/pricingConfig.tsx
git commit -m "feat(web): add shared plan-presentation config"
```

---

## Phase 5 — Frontend plumbing

### Task 8: Test-utils render helper

**Files:**
- Create: `apps/web/src/test-utils.tsx`

**Interfaces:**
- Produces: `renderWithProviders(ui, { queryClient? })` and a re-export of `@testing-library/react`; also exported as `render`.

- [ ] **Step 1: Create the helper**

Create `apps/web/src/test-utils.tsx`:

```tsx
import React, { type ReactElement, type ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";

function createTestQueryClient(): QueryClient {
    return new QueryClient({
        defaultOptions: {
            queries: { retry: false, gcTime: 0 },
            mutations: { retry: false },
        },
    });
}

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
    queryClient?: QueryClient;
}

/**
 * Render a component wrapped in the providers it needs in production.
 */
export function renderWithProviders(
    ui: ReactElement,
    { queryClient = createTestQueryClient(), ...options }: CustomRenderOptions = {}
) {
    function Wrapper({ children }: { children: ReactNode }) {
        return (
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>{children}</MemoryRouter>
            </QueryClientProvider>
        );
    }
    return {
        ...render(ui, { wrapper: Wrapper, ...options }),
        queryClient,
    };
}

export * from "@testing-library/react";
export { renderWithProviders as render };
```

- [ ] **Step 2: Sanity-check it compiles via a trivial test run**

Run: `pnpm --filter @backtrade/web typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/test-utils.tsx
git commit -m "test(web): add testing-library render helper with providers"
```

---

### Task 9: Frontend Stripe request hooks

**Files:**
- Modify: `apps/web/src/api/hooks/requests/stripe.tsx`

**Interfaces:**
- Produces: `useBillingOverview()`, `useInvoices()`, `usePreviewPlanChange()`, `useChangePlan()`, `useCancelSubscription()`, `useResumeSubscription()`.

- [ ] **Step 1: Add the hooks**

In `apps/web/src/api/hooks/requests/stripe.tsx`, extend the import from `@backtrade/types`:

```tsx
import {
    CreateCheckoutSessionRequestSchema,
    CheckoutSessionResponseSchema,
    PortalSessionResponseSchema,
    CheckoutSessionStatusResponseSchema,
    BillingOverviewResponseSchema,
    InvoiceListResponseSchema,
    PlanChangePreviewRequestSchema,
    PlanChangePreviewResponseSchema,
    ChangePlanRequestSchema,
    SubscriptionActionResponseSchema,
} from "@backtrade/types";
```

Append to the file:

```tsx
/**
 * Aggregated billing overview for the plan management page.
 */
export function useBillingOverview() {
    return useGet("/stripe/billing", BillingOverviewResponseSchema);
}

/**
 * Recent invoices for the current user.
 */
export function useInvoices() {
    return useGet("/stripe/invoices", InvoiceListResponseSchema);
}

/**
 * Preview the proration for a plan change.
 */
export function usePreviewPlanChange() {
    return usePost(
        "/stripe/subscription/preview",
        PlanChangePreviewRequestSchema,
        PlanChangePreviewResponseSchema
    );
}

/**
 * Apply a plan change (paid → paid).
 */
export function useChangePlan() {
    return usePost(
        "/stripe/subscription/change",
        ChangePlanRequestSchema,
        SubscriptionActionResponseSchema,
        ["/stripe/billing", "/stripe/invoices"]
    );
}

/**
 * Cancel the subscription at period end.
 */
export function useCancelSubscription() {
    return usePost(
        "/stripe/subscription/cancel",
        z.object({}),
        SubscriptionActionResponseSchema,
        ["/stripe/billing"]
    );
}

/**
 * Resume a subscription scheduled to cancel.
 */
export function useResumeSubscription() {
    return usePost(
        "/stripe/subscription/resume",
        z.object({}),
        SubscriptionActionResponseSchema,
        ["/stripe/billing"]
    );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @backtrade/web typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/api/hooks/requests/stripe.tsx
git commit -m "feat(web): add billing and subscription-action request hooks"
```

---

## Phase 6 — Feature utils & hooks

### Task 10: Feature utils (`plan.ts`, `billing.ts`, `sessions.ts`)

**Files:**
- Create: `apps/web/src/features/plans/utils/plan.ts`
- Create: `apps/web/src/features/plans/utils/billing.ts`
- Create: `apps/web/src/features/plans/utils/sessions.ts`
- Create: `apps/web/src/features/plans/utils/index.ts`
- Test: `apps/web/src/features/plans/utils/billing.test.ts`

**Interfaces:**
- Produces:
  - `formatMoney(amount: number, currency: string): string`
  - `formatPeriodDate(iso: string | null): string`
  - `statusBadgeVariant(status: BillingStatus): BadgeVariant`
  - `statusLabel(status: BillingStatus, periodEnd: string | null): string`
  - `changeActionLabel(currentRank: number, targetRank: number): "Current plan" | "Upgrade" | "Downgrade"`
  - `countActiveSessions(sessions: Session[]): number`

- [ ] **Step 1: Write the failing test**

Create `apps/web/src/features/plans/utils/billing.test.ts`:

```typescript
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
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm --filter @backtrade/web test -- plans/utils/billing.test`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `billing.ts`**

Create `apps/web/src/features/plans/utils/billing.ts`:

```typescript
import type { BillingStatus } from "@backtrade/types";
import type { BadgeVariant } from "../../../components";

/**
 * Format a major-unit amount with its currency.
 */
export function formatMoney(amount: number, currency: string): string {
    try {
        return new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: currency.toUpperCase(),
        }).format(amount);
    } catch {
        return `${amount.toFixed(2)} ${currency.toUpperCase()}`;
    }
}

/**
 * Format an ISO date as a short, human date, or an em dash if null.
 */
export function formatPeriodDate(iso: string | null): string {
    if (!iso) return "—";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    }).format(date);
}

/**
 * Badge variant for a billing status.
 */
export function statusBadgeVariant(status: BillingStatus): BadgeVariant {
    switch (status) {
        case "active":
            return "success";
        case "canceling":
            return "warning";
        case "past_due":
            return "danger";
        case "free":
        default:
            return "neutral";
    }
}

/**
 * Human label describing the current billing state.
 */
export function statusLabel(
    status: BillingStatus,
    periodEnd: string | null
): string {
    switch (status) {
        case "active":
            return `Renews ${formatPeriodDate(periodEnd)}`;
        case "canceling":
            return `Cancels ${formatPeriodDate(periodEnd)} — moves to Free`;
        case "past_due":
            return "Payment past due";
        case "free":
        default:
            return "You're on the Free plan";
    }
}
```

- [ ] **Step 4: Implement `plan.ts`**

Create `apps/web/src/features/plans/utils/plan.ts`:

```typescript
/**
 * Label for the change action of a plan relative to the current one.
 */
export function changeActionLabel(
    currentRank: number,
    targetRank: number
): "Current plan" | "Upgrade" | "Downgrade" {
    if (targetRank === currentRank) return "Current plan";
    return targetRank > currentRank ? "Upgrade" : "Downgrade";
}
```

- [ ] **Step 5: Implement `sessions.ts`**

Create `apps/web/src/features/plans/utils/sessions.ts`:

```typescript
import { type Session, SESSION_STATUS } from "@backtrade/types";

/**
 * Count sessions that count against the active-session quota
 * (anything not archived).
 */
export function countActiveSessions(sessions: Session[]): number {
    return sessions.filter(
        (session) => session.session_status !== SESSION_STATUS.ARCHIVED
    ).length;
}
```

- [ ] **Step 6: Implement the barrel**

Create `apps/web/src/features/plans/utils/index.ts`:

```typescript
export * from "./billing";
export * from "./plan";
export * from "./sessions";
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `pnpm --filter @backtrade/web test -- plans/utils/billing.test`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add apps/web/src/features/plans/utils
git commit -m "feat(web): add plan management formatting and quota utils"
```

---

### Task 11: `usePlanQuota` hook

**Files:**
- Create: `apps/web/src/features/plans/hooks/usePlanQuota.tsx`
- Test: `apps/web/src/features/plans/hooks/usePlanQuota.test.tsx`

**Interfaces:**
- Consumes: `useSessions` from `../../../api/hooks/requests/sessions`, `countActiveSessions` from `../utils`.
- Produces: `usePlanQuota(maxActiveSessions: number): { used: number; max: number; isLoading: boolean }`.

- [ ] **Step 1: Write the failing test**

Create `apps/web/src/features/plans/hooks/usePlanQuota.test.tsx`:

```tsx
import { renderHook } from "../../../test-utils";
import { usePlanQuota } from "./usePlanQuota";
import * as sessionsApi from "../../../api/hooks/requests/sessions";

jest.mock("../../../api/hooks/requests/sessions");

const mockUseSessions = sessionsApi.useSessions as jest.Mock;

it("counts non-archived sessions against the max", () => {
    mockUseSessions.mockReturnValue({
        data: [
            { id: 1, session_status: "RUNNING" },
            { id: 2, session_status: "PAUSED" },
            { id: 3, session_status: "ARCHIVED" },
        ],
        isLoading: false,
    });

    const { result } = renderHook(() => usePlanQuota(10));

    expect(result.current.used).toBe(2);
    expect(result.current.max).toBe(10);
    expect(result.current.isLoading).toBe(false);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm --filter @backtrade/web test -- usePlanQuota.test`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

Create `apps/web/src/features/plans/hooks/usePlanQuota.tsx`:

```tsx
import { useSessions } from "../../../api/hooks/requests/sessions";
import { countActiveSessions } from "../utils";

/**
 * Active-session usage against the current plan's quota.
 */
export function usePlanQuota(maxActiveSessions: number): {
    used: number;
    max: number;
    isLoading: boolean;
} {
    const { data, isLoading } = useSessions();
    const used = countActiveSessions(data ?? []);
    return { used, max: maxActiveSessions, isLoading };
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm --filter @backtrade/web test -- usePlanQuota.test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/features/plans/hooks/usePlanQuota.tsx apps/web/src/features/plans/hooks/usePlanQuota.test.tsx
git commit -m "feat(web): add plan quota usage hook"
```

---

### Task 12: `usePlansPageData` and `useSubscriptionLifecycle`

**Files:**
- Create: `apps/web/src/features/plans/hooks/usePlansPageData.tsx`
- Create: `apps/web/src/features/plans/hooks/useSubscriptionLifecycle.tsx`

**Interfaces:**
- Produces:
  - `usePlansPageData(): { overview: BillingOverviewResponse | null; invoices: Invoice[]; isLoading: boolean; error: Error | null }`
  - `useSubscriptionLifecycle(): { resume: () => Promise<void>; isResuming: boolean }`
- Consumes: `useBillingOverview`, `useInvoices`, `useResumeSubscription` from the request hooks; `useToast` from `../../../hooks`.

- [ ] **Step 1: Implement `usePlansPageData`**

Create `apps/web/src/features/plans/hooks/usePlansPageData.tsx`:

```tsx
import { useMemo } from "react";
import type { BillingOverviewResponse, Invoice } from "@backtrade/types";
import {
    useBillingOverview,
    useInvoices,
} from "../../../api/hooks/requests/stripe";

/**
 * Aggregate the data the plan management page needs.
 */
export function usePlansPageData(): {
    overview: BillingOverviewResponse | null;
    invoices: Invoice[];
    isLoading: boolean;
    error: Error | null;
} {
    const {
        data: overview,
        isLoading: isLoadingOverview,
        error: overviewError,
    } = useBillingOverview();
    const {
        data: invoicesData,
        isLoading: isLoadingInvoices,
        error: invoicesError,
    } = useInvoices();

    const invoices = useMemo(() => invoicesData ?? [], [invoicesData]);

    return {
        overview: overview ?? null,
        invoices,
        isLoading: isLoadingOverview || isLoadingInvoices,
        error: (overviewError ?? invoicesError) as Error | null,
    };
}
```

- [ ] **Step 2: Implement `useSubscriptionLifecycle`**

Create `apps/web/src/features/plans/hooks/useSubscriptionLifecycle.tsx`:

```tsx
import { useCallback } from "react";
import { useResumeSubscription } from "../../../api/hooks/requests/stripe";
import { useToast } from "../../../hooks";

/**
 * Resume a subscription that is scheduled to cancel.
 */
export function useSubscriptionLifecycle(): {
    resume: () => Promise<void>;
    isResuming: boolean;
} {
    const { execute, isLoading } = useResumeSubscription();
    const toast = useToast();

    const resume = useCallback(async () => {
        try {
            await execute({});
            toast.success("Subscription resumed");
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : "Failed to resume subscription"
            );
        }
    }, [execute, toast]);

    return { resume, isResuming: isLoading };
}
```

- [ ] **Step 3: Typecheck**

Run: `pnpm --filter @backtrade/web typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/features/plans/hooks/usePlansPageData.tsx apps/web/src/features/plans/hooks/useSubscriptionLifecycle.tsx
git commit -m "feat(web): add plans page data and resume hooks"
```

---

### Task 13: `usePlanChange` state machine

**Files:**
- Create: `apps/web/src/features/plans/hooks/usePlanChange.tsx`
- Test: `apps/web/src/features/plans/hooks/usePlanChange.test.tsx`

**Interfaces:**
- Consumes: `usePreviewPlanChange`, `useChangePlan`, `useCancelSubscription`, `useCreateCheckoutSession` from request hooks; `useToast`; `getTierRank`, `getPlanPresentation` from `../../../config/plans`; `formatMoney`, `formatPeriodDate` from `../utils`.
- Produces: `usePlanChange(overview): UsePlanChangeResult` where
  ```typescript
  interface PlanChangeDialog {
      title: string;
      message: string;
      confirmLabel: string;
      cancelLabel: string;
      confirmVariant: "primary" | "outline";
      isLoading: boolean;
  }
  interface UsePlanChangeResult {
      selectPlan: (planId: number, planCode: string) => void;
      requestCancel: () => void;
      confirm: () => Promise<void>;
      dismiss: () => void;
      dialog: PlanChangeDialog | null;
      isRedirecting: boolean;
  }
  ```

> The hook owns the single confirmation dialog rendered by `Plans.tsx` via the existing `ConfirmModal`. Behaviour by transition: **Free → paid** redirects to Stripe Checkout (no dialog); **paid → Free** opens a cancel dialog; **paid → paid** opens a change dialog that fetches a proration preview; **same rank** is a no-op.

- [ ] **Step 1: Write the failing test**

Create `apps/web/src/features/plans/hooks/usePlanChange.test.tsx`:

```tsx
import { act, renderHook, waitFor } from "../../../test-utils";
import { usePlanChange } from "./usePlanChange";
import type { BillingOverviewResponse } from "@backtrade/types";
import * as stripeApi from "../../../api/hooks/requests/stripe";

jest.mock("../../../api/hooks/requests/stripe");
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
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm --filter @backtrade/web test -- usePlanChange.test`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

Create `apps/web/src/features/plans/hooks/usePlanChange.tsx`:

```tsx
import { useCallback, useEffect, useState } from "react";
import type {
    BillingOverviewResponse,
    PlanChangePreviewResponse,
} from "@backtrade/types";
import {
    useChangePlan,
    useCancelSubscription,
    useCreateCheckoutSession,
    usePreviewPlanChange,
} from "../../../api/hooks/requests/stripe";
import { useToast } from "../../../hooks";
import { getTierRank } from "../../../config/plans";
import { formatMoney, formatPeriodDate } from "../utils";

interface ChangeTarget {
    kind: "change";
    planId: number;
}
interface CancelTarget {
    kind: "cancel";
}
type PendingAction = ChangeTarget | CancelTarget;

export interface PlanChangeDialog {
    title: string;
    message: string;
    confirmLabel: string;
    cancelLabel: string;
    confirmVariant: "primary" | "outline";
    isLoading: boolean;
}

export interface UsePlanChangeResult {
    selectPlan: (planId: number, planCode: string) => void;
    requestCancel: () => void;
    confirm: () => Promise<void>;
    dismiss: () => void;
    dialog: PlanChangeDialog | null;
    isRedirecting: boolean;
}

function buildChangeMessage(
    preview: PlanChangePreviewResponse | null,
    isPreviewing: boolean
): string {
    if (isPreviewing || !preview) {
        return "Calculating the exact price change…";
    }
    const next = `then ${formatMoney(
        preview.nextChargeAmount,
        preview.currency
    )}/mo from ${formatPeriodDate(preview.nextChargeDate)}.`;
    if (preview.amountDueToday > 0) {
        return `You'll pay ${formatMoney(
            preview.amountDueToday,
            preview.currency
        )} today, ${next}`;
    }
    if (preview.amountDueToday < 0) {
        return `You'll get a ${formatMoney(
            Math.abs(preview.amountDueToday),
            preview.currency
        )} credit, ${next}`;
    }
    return `Your plan changes now, ${next}`;
}

/**
 * State machine for plan changes and cancellation, surfaced as a single
 * confirmation dialog.
 */
export function usePlanChange(
    overview: BillingOverviewResponse
): UsePlanChangeResult {
    const [pending, setPending] = useState<PendingAction | null>(null);
    const [preview, setPreview] = useState<PlanChangePreviewResponse | null>(
        null
    );

    const previewMutation = usePreviewPlanChange();
    const change = useChangePlan();
    const cancel = useCancelSubscription();
    const checkout = useCreateCheckoutSession();
    const toast = useToast();

    const currentRank = getTierRank(overview.plan.code);

    const selectPlan = useCallback(
        (planId: number, planCode: string) => {
            const targetRank = getTierRank(planCode);
            if (targetRank === currentRank) return;

            // Free → paid: first purchase via Stripe Checkout.
            if (overview.status === "free") {
                checkout
                    .execute({ planId })
                    .then((session) => {
                        window.location.href = session.url;
                    })
                    .catch((err: unknown) => {
                        toast.error(
                            err instanceof Error
                                ? err.message
                                : "Failed to start checkout"
                        );
                    });
                return;
            }

            // paid → Free: cancel at period end.
            if (targetRank === 0) {
                setPending({ kind: "cancel" });
                return;
            }

            // paid → paid: confirm with a proration preview.
            setPreview(null);
            setPending({ kind: "change", planId });
        },
        [overview.status, currentRank, checkout, toast]
    );

    // Fetch the preview whenever a change action is pending.
    useEffect(() => {
        if (pending?.kind !== "change") return;
        let cancelled = false;
        previewMutation
            .execute({ planId: pending.planId })
            .then((data) => {
                if (!cancelled) setPreview(data);
            })
            .catch(() => {
                /* dialog falls back to a generic message */
            });
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pending]);

    const requestCancel = useCallback(() => {
        setPending({ kind: "cancel" });
    }, []);

    const dismiss = useCallback(() => {
        setPending(null);
        setPreview(null);
    }, []);

    const confirm = useCallback(async () => {
        if (!pending) return;
        try {
            if (pending.kind === "change") {
                await change.execute({ planId: pending.planId });
                toast.success("Plan updated");
            } else {
                await cancel.execute({});
                toast.success("Subscription will cancel at period end");
            }
            setPending(null);
            setPreview(null);
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : "Action failed"
            );
        }
    }, [pending, change, cancel, toast]);

    let dialog: PlanChangeDialog | null = null;
    if (pending?.kind === "change") {
        dialog = {
            title: "Change plan",
            message: buildChangeMessage(preview, previewMutation.isLoading),
            confirmLabel: "Confirm change",
            cancelLabel: "Keep current plan",
            confirmVariant: "primary",
            isLoading: previewMutation.isLoading || change.isLoading,
        };
    } else if (pending?.kind === "cancel") {
        dialog = {
            title: "Cancel subscription",
            message:
                "You'll keep your current plan until the end of the billing period, then move to Free. You can resume any time before then.",
            confirmLabel: "Cancel subscription",
            cancelLabel: "Keep plan",
            confirmVariant: "outline",
            isLoading: cancel.isLoading,
        };
    }

    return {
        selectPlan,
        requestCancel,
        confirm,
        dismiss,
        dialog,
        isRedirecting: checkout.isLoading,
    };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm --filter @backtrade/web test -- usePlanChange.test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/features/plans/hooks/usePlanChange.tsx apps/web/src/features/plans/hooks/usePlanChange.test.tsx
git commit -m "feat(web): add plan-change state machine hook"
```

---

## Phase 7 — Components

### Task 14: `PlanSummary` (hero)

**Files:**
- Create: `apps/web/src/features/plans/components/PlanSummary/PlanSummary.tsx`
- Create: `apps/web/src/features/plans/components/PlanSummary/PlanSummary.module.css`
- Create: `apps/web/src/features/plans/components/PlanSummary/index.tsx`
- Test: `apps/web/src/features/plans/components/PlanSummary/PlanSummary.test.tsx`

**Interfaces:**
- Consumes: `BillingOverviewResponse`, `usePlanQuota`, `Badge`, `Button`, billing utils.
- Produces: `PlanSummary` with props:
  ```typescript
  interface PlanSummaryProps {
      overview: BillingOverviewResponse;
      onChangePlan: () => void;
      onCancel: () => void;
      onResume: () => void;
      onUpdatePayment: () => void;
      isBusy: boolean;
  }
  ```

- [ ] **Step 1: Write the failing test**

Create `apps/web/src/features/plans/components/PlanSummary/PlanSummary.test.tsx`:

```tsx
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
    nextCharge: { amount: 19, currency: "eur", date: "2026-07-14T00:00:00.000Z" },
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
    expect(
        screen.getByRole("button", { name: /cancel/i })
    ).toBeInTheDocument();
});

it("shows Resume when canceling", () => {
    renderSummary({ ...base, status: "canceling", cancelAtPeriodEnd: true });
    expect(
        screen.getByRole("button", { name: /resume/i })
    ).toBeInTheDocument();
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
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm --filter @backtrade/web test -- PlanSummary.test`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the component**

Create `apps/web/src/features/plans/components/PlanSummary/PlanSummary.tsx`:

```tsx
import type { BillingOverviewResponse } from "@backtrade/types";
import { Badge, Button } from "../../../../components";
import { usePlanQuota } from "../../hooks/usePlanQuota";
import {
    formatMoney,
    statusBadgeVariant,
    statusLabel,
} from "../../utils";
import styles from "./PlanSummary.module.css";

interface PlanSummaryProps {
    overview: BillingOverviewResponse;
    onChangePlan: () => void;
    onCancel: () => void;
    onResume: () => void;
    onUpdatePayment: () => void;
    isBusy: boolean;
}

const STATUS_TEXT: Record<BillingOverviewResponse["status"], string> = {
    free: "Free",
    active: "Active",
    canceling: "Canceling",
    past_due: "Past due",
};

/**
 * Current-plan hero: plan name, status, price, renewal line, quota, actions.
 */
export function PlanSummary({
    overview,
    onChangePlan,
    onCancel,
    onResume,
    onUpdatePayment,
    isBusy,
}: PlanSummaryProps) {
    const { used, max } = usePlanQuota(overview.plan.maxActiveSessions);
    const quotaPercent = max > 0 ? Math.min(100, (used / max) * 100) : 0;

    const priceLabel =
        overview.plan.price > 0
            ? `${formatMoney(overview.plan.price, overview.plan.currency)} / month`
            : "Free";

    return (
        <section className={styles.card} aria-label="Current plan">
            <div className={styles.top}>
                <div className={styles.titleBlock}>
                    <h2 className={styles.planName}>
                        {overview.plan.displayName}
                    </h2>
                    <Badge variant={statusBadgeVariant(overview.status)}>
                        {STATUS_TEXT[overview.status]}
                    </Badge>
                </div>
                <span className={styles.price}>{priceLabel}</span>
            </div>

            <p className={styles.renewal}>
                {statusLabel(overview.status, overview.currentPeriodEnd)}
            </p>

            <div className={styles.quota}>
                <div className={styles.quotaHeader}>
                    <span className={styles.quotaLabel}>Active sessions</span>
                    <span className={styles.quotaValue}>
                        {used} / {max}
                    </span>
                </div>
                <div
                    className={styles.quotaTrack}
                    role="progressbar"
                    aria-valuenow={used}
                    aria-valuemin={0}
                    aria-valuemax={max}
                >
                    <div
                        className={styles.quotaFill}
                        style={{ width: `${quotaPercent}%` }}
                    />
                </div>
            </div>

            <div className={styles.actions}>
                {overview.status === "free" && (
                    <Button
                        variant="primary"
                        size="medium"
                        onClick={onChangePlan}
                        disabled={isBusy}
                    >
                        Upgrade
                    </Button>
                )}
                {overview.status === "active" && (
                    <>
                        <Button
                            variant="primary"
                            size="medium"
                            onClick={onChangePlan}
                            disabled={isBusy}
                        >
                            Change plan
                        </Button>
                        <Button
                            variant="outline"
                            size="medium"
                            onClick={onCancel}
                            disabled={isBusy}
                        >
                            Cancel
                        </Button>
                    </>
                )}
                {overview.status === "canceling" && (
                    <Button
                        variant="primary"
                        size="medium"
                        onClick={onResume}
                        disabled={isBusy}
                    >
                        Resume subscription
                    </Button>
                )}
                {overview.status === "past_due" && (
                    <Button
                        variant="primary"
                        size="medium"
                        onClick={onUpdatePayment}
                        disabled={isBusy}
                    >
                        Update payment
                    </Button>
                )}
            </div>
        </section>
    );
}
```

- [ ] **Step 4: Create the styles**

Create `apps/web/src/features/plans/components/PlanSummary/PlanSummary.module.css`:

```css
.card {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    background-color: var(--color-surface-secondary);
    border: 1px solid var(--color-border-primary);
    border-radius: var(--radius-xl);
    padding: var(--spacing-xl);
}

.top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-md);
}

.titleBlock {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
}

.planName {
    margin: 0;
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
}

.price {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
}

.renewal {
    margin: 0;
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
}

.quota {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
}

.quotaHeader {
    display: flex;
    justify-content: space-between;
    font-size: var(--font-size-sm);
}

.quotaLabel {
    color: var(--color-text-secondary);
}

.quotaValue {
    color: var(--color-text-primary);
    font-weight: var(--font-weight-medium);
}

.quotaTrack {
    width: 100%;
    height: var(--spacing-sm);
    background-color: var(--color-surface-tertiary);
    border-radius: var(--radius-full);
    overflow: hidden;
}

.quotaFill {
    height: 100%;
    background-color: var(--color-accent);
    border-radius: var(--radius-full);
    transition: width var(--transition-base);
}

.actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-md);
    margin-top: var(--spacing-sm);
}

@media (max-width: 768px) {
    .card {
        padding: var(--spacing-lg);
    }

    .top {
        flex-direction: column;
        align-items: flex-start;
    }
}
```

- [ ] **Step 5: Create the barrel**

Create `apps/web/src/features/plans/components/PlanSummary/index.tsx`:

```tsx
export { PlanSummary } from "./PlanSummary";
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `pnpm --filter @backtrade/web test -- PlanSummary.test`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/features/plans/components/PlanSummary
git commit -m "feat(web): add plan summary hero component"
```

---

### Task 15: `PlanOptionCard` + `PlanPicker`

**Files:**
- Create: `apps/web/src/features/plans/components/PlanPicker/PlanOptionCard/{PlanOptionCard.tsx,PlanOptionCard.module.css,index.tsx}`
- Create: `apps/web/src/features/plans/components/PlanPicker/{PlanPicker.tsx,PlanPicker.module.css,index.tsx}`
- Test: `apps/web/src/features/plans/components/PlanPicker/PlanPicker.test.tsx`

**Interfaces:**
- Consumes: `Plan`, `BillingOverviewResponse`, `getPlanPresentation`, `getTierRank`, `changeActionLabel`, `formatMoney`, `Button`, `Badge`.
- Produces:
  - `PlanOptionCard` props: `{ displayName: string; tagline: string; price: number; currency: string; features: string[]; recommended: boolean; actionLabel: string; isCurrent: boolean; disabled: boolean; onSelect: () => void }`
  - `PlanPicker` props: `{ plans: Plan[]; overview: BillingOverviewResponse; onSelectPlan: (planId: number, planCode: string) => void; disabled: boolean }`

- [ ] **Step 1: Write the failing test**

Create `apps/web/src/features/plans/components/PlanPicker/PlanPicker.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm --filter @backtrade/web test -- PlanPicker.test`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `PlanOptionCard`**

Create `apps/web/src/features/plans/components/PlanPicker/PlanOptionCard/PlanOptionCard.tsx`:

```tsx
import { Badge, Button } from "../../../../../components";
import { formatMoney } from "../../../utils";
import styles from "./PlanOptionCard.module.css";

interface PlanOptionCardProps {
    displayName: string;
    tagline: string;
    price: number;
    currency: string;
    features: string[];
    recommended: boolean;
    actionLabel: string;
    isCurrent: boolean;
    disabled: boolean;
    onSelect: () => void;
}

/**
 * A single selectable plan in the change-plan grid.
 */
export function PlanOptionCard({
    displayName,
    tagline,
    price,
    currency,
    features,
    recommended,
    actionLabel,
    isCurrent,
    disabled,
    onSelect,
}: PlanOptionCardProps) {
    return (
        <div
            className={`${styles.card} ${isCurrent ? styles.current : ""} ${
                recommended ? styles.recommended : ""
            }`}
        >
            <div className={styles.header}>
                <h3 className={styles.name}>{displayName}</h3>
                {recommended && <Badge variant="accent">Popular</Badge>}
            </div>
            <p className={styles.tagline}>{tagline}</p>

            <div className={styles.priceRow}>
                <span className={styles.price}>
                    {price > 0 ? formatMoney(price, currency) : "Free"}
                </span>
                {price > 0 && <span className={styles.period}>/mo</span>}
            </div>

            <ul className={styles.features}>
                {features.map((feature) => (
                    <li key={feature} className={styles.feature}>
                        {feature}
                    </li>
                ))}
            </ul>

            <div className={styles.action}>
                <Button
                    variant={isCurrent ? "outline" : "primary"}
                    size="medium"
                    fullWidth
                    disabled={disabled || isCurrent}
                    onClick={onSelect}
                >
                    {actionLabel}
                </Button>
            </div>
        </div>
    );
}
```

- [ ] **Step 4: Create `PlanOptionCard` styles**

Create `apps/web/src/features/plans/components/PlanPicker/PlanOptionCard/PlanOptionCard.module.css`:

```css
.card {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    background-color: var(--color-surface-secondary);
    border: 1px solid var(--color-border-primary);
    border-radius: var(--radius-lg);
    padding: var(--spacing-lg);
}

.card.recommended {
    border-color: var(--color-border-accent);
}

.card.current {
    border-color: var(--color-accent);
    border-width: 2px;
}

.header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-sm);
}

.name {
    margin: 0;
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
}

.tagline {
    margin: 0;
    font-size: var(--font-size-sm);
    color: var(--color-text-tertiary);
}

.priceRow {
    display: flex;
    align-items: baseline;
    gap: var(--spacing-xs);
}

.price {
    font-size: var(--font-size-3xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
}

.period {
    font-size: var(--font-size-base);
    color: var(--color-text-secondary);
}

.features {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    flex: 1;
}

.feature {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
}

.action {
    margin-top: auto;
}
```

- [ ] **Step 5: Create `PlanOptionCard` barrel**

Create `apps/web/src/features/plans/components/PlanPicker/PlanOptionCard/index.tsx`:

```tsx
export { PlanOptionCard } from "./PlanOptionCard";
```

- [ ] **Step 6: Implement `PlanPicker`**

Create `apps/web/src/features/plans/components/PlanPicker/PlanPicker.tsx`:

```tsx
import { useMemo } from "react";
import type { BillingOverviewResponse, Plan } from "@backtrade/types";
import {
    getPlanPresentation,
    getTierRank,
    PLAN_PRESENTATION,
} from "../../../../config/plans";
import { changeActionLabel } from "../../utils";
import { PlanOptionCard } from "./PlanOptionCard";
import styles from "./PlanPicker.module.css";

interface PlanPickerProps {
    plans: Plan[];
    overview: BillingOverviewResponse;
    onSelectPlan: (planId: number, planCode: string) => void;
    disabled: boolean;
}

interface DisplayPlan {
    id: number;
    code: string;
    price: number;
    currency: string;
    tierRank: number;
}

/**
 * Build the ordered list of plans to show: a synthetic Free tier plus the
 * paid plans from the API, sorted by tier rank.
 */
function buildDisplayPlans(plans: Plan[]): DisplayPlan[] {
    const apiPlans: DisplayPlan[] = plans
        .filter((plan) => plan.code !== "FREE")
        .map((plan) => ({
            id: plan.id,
            code: plan.code,
            price: Number(plan.price),
            currency: plan.currency.toLowerCase(),
            tierRank: getTierRank(plan.code),
        }));

    const free: DisplayPlan = {
        id: 0,
        code: "FREE",
        price: 0,
        currency: "eur",
        tierRank: PLAN_PRESENTATION.FREE.tierRank,
    };

    return [free, ...apiPlans].sort((a, b) => a.tierRank - b.tierRank);
}

/**
 * The "Change plan" section: a grid of selectable plans.
 */
export function PlanPicker({
    plans,
    overview,
    onSelectPlan,
    disabled,
}: PlanPickerProps) {
    const displayPlans = useMemo(() => buildDisplayPlans(plans), [plans]);
    const currentRank = getTierRank(overview.plan.code);

    return (
        <section className={styles.section} aria-label="Change plan">
            <h2 className={styles.heading}>Change plan</h2>
            <div className={styles.grid}>
                {displayPlans.map((plan) => {
                    const presentation = getPlanPresentation(plan.code);
                    const isCurrent = plan.tierRank === currentRank;
                    return (
                        <PlanOptionCard
                            key={plan.code}
                            displayName={presentation.displayName}
                            tagline={presentation.tagline}
                            price={plan.price}
                            currency={plan.currency}
                            features={presentation.features}
                            recommended={presentation.recommended}
                            isCurrent={isCurrent}
                            disabled={disabled}
                            actionLabel={changeActionLabel(
                                currentRank,
                                plan.tierRank
                            )}
                            onSelect={() => onSelectPlan(plan.id, plan.code)}
                        />
                    );
                })}
            </div>
        </section>
    );
}
```

- [ ] **Step 7: Create `PlanPicker` styles**

Create `apps/web/src/features/plans/components/PlanPicker/PlanPicker.module.css`:

```css
.section {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
}

.heading {
    margin: 0;
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
}

.grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: var(--spacing-lg);
}
```

- [ ] **Step 8: Create `PlanPicker` barrel**

Create `apps/web/src/features/plans/components/PlanPicker/index.tsx`:

```tsx
export { PlanPicker } from "./PlanPicker";
```

- [ ] **Step 9: Run the test to verify it passes**

Run: `pnpm --filter @backtrade/web test -- PlanPicker.test`
Expected: PASS.

- [ ] **Step 10: Commit**

```bash
git add apps/web/src/features/plans/components/PlanPicker
git commit -m "feat(web): add plan picker and option card components"
```

---

### Task 16: `PaymentMethod`

**Files:**
- Create: `apps/web/src/features/plans/components/PaymentMethod/{PaymentMethod.tsx,PaymentMethod.module.css,index.tsx}`
- Test: `apps/web/src/features/plans/components/PaymentMethod/PaymentMethod.test.tsx`

**Interfaces:**
- Produces: `PaymentMethod` props `{ paymentMethod: BillingPaymentMethod | null; onManage: () => void; disabled: boolean }`.

- [ ] **Step 1: Write the failing test**

Create `apps/web/src/features/plans/components/PaymentMethod/PaymentMethod.test.tsx`:

```tsx
import { render, screen, fireEvent } from "../../../../test-utils";
import { PaymentMethod } from "./PaymentMethod";

it("renders the card brand and last4", () => {
    render(
        <PaymentMethod
            paymentMethod={{
                brand: "visa",
                last4: "4242",
                expMonth: 12,
                expYear: 2030,
            }}
            onManage={jest.fn()}
            disabled={false}
        />
    );
    expect(screen.getByText(/visa/i)).toBeInTheDocument();
    expect(screen.getByText(/4242/)).toBeInTheDocument();
});

it("renders an empty state with no card", () => {
    render(
        <PaymentMethod
            paymentMethod={null}
            onManage={jest.fn()}
            disabled={false}
        />
    );
    expect(screen.getByText(/no payment method/i)).toBeInTheDocument();
});

it("calls onManage when the button is clicked", () => {
    const onManage = jest.fn();
    render(
        <PaymentMethod
            paymentMethod={null}
            onManage={onManage}
            disabled={false}
        />
    );
    fireEvent.click(screen.getByRole("button", { name: /payment method/i }));
    expect(onManage).toHaveBeenCalled();
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm --filter @backtrade/web test -- PaymentMethod.test`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the component**

Create `apps/web/src/features/plans/components/PaymentMethod/PaymentMethod.tsx`:

```tsx
import type { BillingPaymentMethod } from "@backtrade/types";
import { Button } from "../../../../components";
import styles from "./PaymentMethod.module.css";

interface PaymentMethodProps {
    paymentMethod: BillingPaymentMethod | null;
    onManage: () => void;
    disabled: boolean;
}

function titleCase(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Shows the card on file; editing happens in the Stripe portal.
 */
export function PaymentMethod({
    paymentMethod,
    onManage,
    disabled,
}: PaymentMethodProps) {
    return (
        <section className={styles.section} aria-label="Payment method">
            <h2 className={styles.heading}>Payment method</h2>
            <div className={styles.card}>
                {paymentMethod ? (
                    <span className={styles.details}>
                        {titleCase(paymentMethod.brand)} ···· {paymentMethod.last4}
                        <span className={styles.expiry}>
                            Expires {paymentMethod.expMonth}/
                            {paymentMethod.expYear}
                        </span>
                    </span>
                ) : (
                    <span className={styles.empty}>
                        No payment method on file
                    </span>
                )}
                <Button
                    variant="outline"
                    size="small"
                    onClick={onManage}
                    disabled={disabled}
                >
                    {paymentMethod
                        ? "Update payment method"
                        : "Add payment method"}
                </Button>
            </div>
        </section>
    );
}
```

- [ ] **Step 4: Create the styles**

Create `apps/web/src/features/plans/components/PaymentMethod/PaymentMethod.module.css`:

```css
.section {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
}

.heading {
    margin: 0;
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
}

.card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-md);
    background-color: var(--color-surface-secondary);
    border: 1px solid var(--color-border-primary);
    border-radius: var(--radius-lg);
    padding: var(--spacing-lg);
}

.details {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
}

.expiry {
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-regular);
    color: var(--color-text-tertiary);
}

.empty {
    font-size: var(--font-size-base);
    color: var(--color-text-secondary);
}

@media (max-width: 768px) {
    .card {
        flex-direction: column;
        align-items: flex-start;
    }
}
```

- [ ] **Step 5: Create the barrel**

Create `apps/web/src/features/plans/components/PaymentMethod/index.tsx`:

```tsx
export { PaymentMethod } from "./PaymentMethod";
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `pnpm --filter @backtrade/web test -- PaymentMethod.test`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/features/plans/components/PaymentMethod
git commit -m "feat(web): add payment method component"
```

---

### Task 17: `InvoiceRow` + `InvoiceList`

**Files:**
- Create: `apps/web/src/features/plans/components/InvoiceList/InvoiceRow/{InvoiceRow.tsx,InvoiceRow.module.css,index.tsx}`
- Create: `apps/web/src/features/plans/components/InvoiceList/{InvoiceList.tsx,InvoiceList.module.css,index.tsx}`
- Test: `apps/web/src/features/plans/components/InvoiceList/InvoiceList.test.tsx`

**Interfaces:**
- Produces:
  - `InvoiceRow` props `{ invoice: Invoice }`.
  - `InvoiceList` props `{ invoices: Invoice[] }`.

- [ ] **Step 1: Write the failing test**

Create `apps/web/src/features/plans/components/InvoiceList/InvoiceList.test.tsx`:

```tsx
import { render, screen } from "../../../../test-utils";
import { InvoiceList } from "./InvoiceList";
import type { Invoice } from "@backtrade/types";

const invoices: Invoice[] = [
    {
        id: "in_1",
        number: "BT-001",
        date: "2026-06-14T00:00:00.000Z",
        amount: 19,
        currency: "eur",
        status: "paid",
        hostedUrl: "https://pay/in_1",
        pdfUrl: "https://pdf/in_1",
    },
];

it("renders an invoice row with a PDF link", () => {
    render(<InvoiceList invoices={invoices} />);
    expect(screen.getByText(/BT-001/)).toBeInTheDocument();
    expect(screen.getByText(/paid/i)).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /pdf/i });
    expect(link).toHaveAttribute("href", "https://pdf/in_1");
});

it("renders an empty state with no invoices", () => {
    render(<InvoiceList invoices={[]} />);
    expect(screen.getByText(/no invoices yet/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm --filter @backtrade/web test -- InvoiceList.test`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `InvoiceRow`**

Create `apps/web/src/features/plans/components/InvoiceList/InvoiceRow/InvoiceRow.tsx`:

```tsx
import type { Invoice } from "@backtrade/types";
import { Badge, type BadgeVariant } from "../../../../../components";
import { formatMoney, formatPeriodDate } from "../../../utils";
import styles from "./InvoiceRow.module.css";

interface InvoiceRowProps {
    invoice: Invoice;
}

function invoiceBadgeVariant(status: string): BadgeVariant {
    if (status === "paid") return "success";
    if (status === "open") return "warning";
    if (status === "uncollectible" || status === "void") return "danger";
    return "neutral";
}

/**
 * A single invoice line: date, number, amount, status, and a PDF link.
 */
export function InvoiceRow({ invoice }: InvoiceRowProps) {
    const downloadUrl = invoice.pdfUrl ?? invoice.hostedUrl;
    return (
        <div className={styles.row}>
            <span className={styles.date}>
                {formatPeriodDate(invoice.date)}
            </span>
            <span className={styles.number}>{invoice.number ?? "—"}</span>
            <span className={styles.amount}>
                {formatMoney(invoice.amount, invoice.currency)}
            </span>
            <Badge variant={invoiceBadgeVariant(invoice.status)}>
                {invoice.status}
            </Badge>
            {downloadUrl ? (
                <a
                    className={styles.link}
                    href={downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                >
                    PDF
                </a>
            ) : (
                <span className={styles.linkDisabled}>—</span>
            )}
        </div>
    );
}
```

- [ ] **Step 4: Create `InvoiceRow` styles**

Create `apps/web/src/features/plans/components/InvoiceList/InvoiceRow/InvoiceRow.module.css`:

```css
.row {
    display: grid;
    grid-template-columns: 1.2fr 1fr 1fr auto auto;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-md) 0;
    border-bottom: 1px solid var(--color-border-secondary);
}

.row:last-child {
    border-bottom: none;
}

.date,
.amount {
    font-size: var(--font-size-sm);
    color: var(--color-text-primary);
    font-weight: var(--font-weight-medium);
}

.number {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
}

.link {
    font-size: var(--font-size-sm);
    color: var(--color-accent);
    text-decoration: none;
}

.link:hover {
    text-decoration: underline;
}

.linkDisabled {
    font-size: var(--font-size-sm);
    color: var(--color-text-tertiary);
}

@media (max-width: 768px) {
    .row {
        grid-template-columns: 1fr 1fr;
        row-gap: var(--spacing-xs);
    }

    .number {
        display: none;
    }
}
```

- [ ] **Step 5: Create `InvoiceRow` barrel**

Create `apps/web/src/features/plans/components/InvoiceList/InvoiceRow/index.tsx`:

```tsx
export { InvoiceRow } from "./InvoiceRow";
```

- [ ] **Step 6: Implement `InvoiceList`**

Create `apps/web/src/features/plans/components/InvoiceList/InvoiceList.tsx`:

```tsx
import type { Invoice } from "@backtrade/types";
import { InvoiceRow } from "./InvoiceRow";
import styles from "./InvoiceList.module.css";

interface InvoiceListProps {
    invoices: Invoice[];
}

/**
 * The invoices/billing-history section.
 */
export function InvoiceList({ invoices }: InvoiceListProps) {
    return (
        <section className={styles.section} aria-label="Invoices">
            <h2 className={styles.heading}>Invoices</h2>
            {invoices.length === 0 ? (
                <p className={styles.empty}>No invoices yet</p>
            ) : (
                <div className={styles.list}>
                    {invoices.map((invoice) => (
                        <InvoiceRow key={invoice.id} invoice={invoice} />
                    ))}
                </div>
            )}
        </section>
    );
}
```

- [ ] **Step 7: Create `InvoiceList` styles**

Create `apps/web/src/features/plans/components/InvoiceList/InvoiceList.module.css`:

```css
.section {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
}

.heading {
    margin: 0;
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
}

.list {
    background-color: var(--color-surface-secondary);
    border: 1px solid var(--color-border-primary);
    border-radius: var(--radius-lg);
    padding: 0 var(--spacing-lg);
}

.empty {
    margin: 0;
    font-size: var(--font-size-base);
    color: var(--color-text-secondary);
}
```

- [ ] **Step 8: Create `InvoiceList` barrel**

Create `apps/web/src/features/plans/components/InvoiceList/index.tsx`:

```tsx
export { InvoiceList } from "./InvoiceList";
```

- [ ] **Step 9: Run the test to verify it passes**

Run: `pnpm --filter @backtrade/web test -- InvoiceList.test`
Expected: PASS.

- [ ] **Step 10: Commit**

```bash
git add apps/web/src/features/plans/components/InvoiceList
git commit -m "feat(web): add invoice list and row components"
```

---

## Phase 8 — Assembly & cleanup

### Task 18: Rebuild `Plans.tsx`, barrels, and delete old components

**Files:**
- Modify: `apps/web/src/features/plans/Plans.tsx`
- Modify: `apps/web/src/features/plans/Plans.module.css`
- Modify: `apps/web/src/features/plans/hooks/index.tsx`
- Modify: `apps/web/src/features/plans/components/index.tsx`
- Delete: `CurrentSubscription/`, `SubscriptionList/`, `SubscriptionCard/`, `PlanCard/`, `PlanList/` directories; `hooks/usePlansData.tsx`; `hooks/useSubscriptionManagement.tsx`; `utils/subscriptions.ts`; old `utils/plan.ts` if it duplicates (check before deleting).
- Test: `apps/web/src/features/plans/Plans.test.tsx`

**Interfaces:**
- Consumes: `usePlansPageData`, `usePlanChange`, `useSubscriptionLifecycle`, `useCreatePortalSession`, all new components, `ConfirmModal`, `Skeleton`, `ErrorState`.

- [ ] **Step 1: Write the failing test**

Create `apps/web/src/features/plans/Plans.test.tsx`:

```tsx
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
    nextCharge: { amount: 19, currency: "eur", date: "2026-07-14T00:00:00.000Z" },
    paymentMethod: { brand: "visa", last4: "4242", expMonth: 12, expYear: 2030 },
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
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm --filter @backtrade/web test -- features/plans/Plans.test`
Expected: FAIL — `Plans` still references the old structure / sections not found.

- [ ] **Step 3: Rebuild `Plans.tsx`**

Replace the contents of `apps/web/src/features/plans/Plans.tsx`:

```tsx
import { useRef, type RefObject } from "react";
import { ErrorState } from "../dashboard/components/ErrorState";
import { ConfirmModal, Skeleton } from "../../components";
import { usePlans } from "../../api/hooks/requests/plans";
import { useCreatePortalSession } from "../../api/hooks/requests/stripe";
import { usePlansPageData } from "./hooks/usePlansPageData";
import { usePlanChange } from "./hooks/usePlanChange";
import { useSubscriptionLifecycle } from "./hooks/useSubscriptionLifecycle";
import { PlanSummary } from "./components/PlanSummary";
import { PlanPicker } from "./components/PlanPicker";
import { PaymentMethod } from "./components/PaymentMethod";
import { InvoiceList } from "./components/InvoiceList";
import styles from "./Plans.module.css";

/**
 * Plan management page: current plan + billing summary, plan picker,
 * payment method, and invoices.
 */
export function Plans() {
    const { overview, invoices, isLoading, error } = usePlansPageData();
    const { data: plansData } = usePlans();
    const { execute: openPortal, isLoading: isOpeningPortal } =
        useCreatePortalSession();
    const pickerRef = useRef<HTMLDivElement>(null);

    if (isLoading || !overview) {
        return (
            <div className={styles.container}>
                <Skeleton height={160} />
                <Skeleton height={280} />
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <ErrorState error={error} />
            </div>
        );
    }

    return <PlansContent overview={overview} invoices={invoices} plans={plansData ?? []} openPortal={openPortal} isOpeningPortal={isOpeningPortal} pickerRef={pickerRef} />;
}

interface PlansContentProps {
    overview: NonNullable<ReturnType<typeof usePlansPageData>["overview"]>;
    invoices: ReturnType<typeof usePlansPageData>["invoices"];
    plans: ReturnType<typeof usePlans>["data"];
    openPortal: ReturnType<typeof useCreatePortalSession>["execute"];
    isOpeningPortal: boolean;
    pickerRef: RefObject<HTMLDivElement>;
}

/**
 * Rendered once the overview is loaded so plan-change hooks always
 * receive a defined overview.
 */
function PlansContent({
    overview,
    invoices,
    plans,
    openPortal,
    isOpeningPortal,
    pickerRef,
}: PlansContentProps) {
    const planChange = usePlanChange(overview);
    const { resume, isResuming } = useSubscriptionLifecycle();

    const goToPortal = async () => {
        try {
            const session = await openPortal({});
            window.location.href = session.url;
        } catch {
            /* surfaced by the portal hook caller; no-op here */
        }
    };

    const scrollToPicker = () => {
        pickerRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const busy = planChange.isRedirecting || isOpeningPortal || isResuming;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Plans &amp; billing</h1>
            </header>

            <div className={styles.content}>
                <PlanSummary
                    overview={overview}
                    onChangePlan={scrollToPicker}
                    onCancel={planChange.requestCancel}
                    onResume={resume}
                    onUpdatePayment={goToPortal}
                    isBusy={busy}
                />

                <div ref={pickerRef}>
                    <PlanPicker
                        plans={plans ?? []}
                        overview={overview}
                        onSelectPlan={planChange.selectPlan}
                        disabled={busy}
                    />
                </div>

                <PaymentMethod
                    paymentMethod={overview.paymentMethod}
                    onManage={goToPortal}
                    disabled={busy}
                />

                <InvoiceList invoices={invoices} />

                <button
                    type="button"
                    className={styles.portalLink}
                    onClick={goToPortal}
                    disabled={busy}
                >
                    Manage billing in Stripe
                </button>
            </div>

            {planChange.dialog && (
                <ConfirmModal
                    isOpen
                    title={planChange.dialog.title}
                    message={planChange.dialog.message}
                    confirmLabel={planChange.dialog.confirmLabel}
                    cancelLabel={planChange.dialog.cancelLabel}
                    confirmVariant={planChange.dialog.confirmVariant}
                    isLoading={planChange.dialog.isLoading}
                    onConfirm={planChange.confirm}
                    onCancel={planChange.dismiss}
                />
            )}
        </div>
    );
}
```

- [ ] **Step 4: Update `Plans.module.css`**

Replace `apps/web/src/features/plans/Plans.module.css`:

```css
.container {
    width: 100%;
    max-width: 1100px;
    margin: 0 auto;
    padding: var(--spacing-xl);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xl);
}

.header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.title {
    margin: 0;
    font-size: var(--font-size-4xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
}

.content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2xl);
}

.portalLink {
    align-self: flex-start;
    background: none;
    border: none;
    padding: 0;
    font-size: var(--font-size-sm);
    color: var(--color-text-tertiary);
    cursor: pointer;
    transition: color var(--transition-fast);
}

.portalLink:hover:not(:disabled) {
    color: var(--color-text-secondary);
}

.portalLink:disabled {
    cursor: not-allowed;
    opacity: 0.5;
}

@media (max-width: 768px) {
    .container {
        padding: var(--spacing-md);
    }

    .title {
        font-size: var(--font-size-3xl);
    }
}
```

- [ ] **Step 5: Update the hooks barrel**

Replace `apps/web/src/features/plans/hooks/index.tsx`:

```tsx
export { usePlansPageData } from "./usePlansPageData";
export { usePlanQuota } from "./usePlanQuota";
export { usePlanChange } from "./usePlanChange";
export { useSubscriptionLifecycle } from "./useSubscriptionLifecycle";
```

- [ ] **Step 6: Update the components barrel**

Replace `apps/web/src/features/plans/components/index.tsx`:

```tsx
export { PlanSummary } from "./PlanSummary";
export { PlanPicker } from "./PlanPicker";
export { PaymentMethod } from "./PaymentMethod";
export { InvoiceList } from "./InvoiceList";
export { PurchaseSuccess } from "./PurchaseSuccess";
```

- [ ] **Step 7: Delete the obsolete files**

Run:

```bash
git rm -r \
  apps/web/src/features/plans/components/CurrentSubscription \
  apps/web/src/features/plans/components/SubscriptionList \
  apps/web/src/features/plans/components/SubscriptionCard \
  apps/web/src/features/plans/components/PlanCard \
  apps/web/src/features/plans/components/PlanList \
  apps/web/src/features/plans/hooks/usePlansData.tsx \
  apps/web/src/features/plans/hooks/useSubscriptionManagement.tsx \
  apps/web/src/features/plans/utils/subscriptions.ts
```

Then confirm no stale references remain:

Run: `grep -rn "usePlansData\|useSubscriptionManagement\|CurrentSubscription\|SubscriptionList\|SubscriptionCard\|PlanList\|/PlanCard" apps/web/src`
Expected: no matches (the `utils/index.ts` from Task 10 already replaced the old `utils` barrel — verify it does not re-export `./subscriptions`).

- [ ] **Step 8: Run the page test to verify it passes**

Run: `pnpm --filter @backtrade/web test -- features/plans/Plans.test`
Expected: PASS.

- [ ] **Step 9: Full web checks**

Run: `pnpm --filter @backtrade/web typecheck`
Expected: PASS.

Run: `pnpm --filter @backtrade/web lint`
Expected: PASS.

Run: `pnpm --filter @backtrade/web test`
Expected: PASS (all plan tests green).

Run: `pnpm --filter @backtrade/web exec prettier --check "src/**/*.{ts,tsx,css}"`
Expected: PASS (run `prettier --write` on any flagged files, then re-check).

- [ ] **Step 10: Commit**

```bash
git add apps/web/src/features/plans
git commit -m "feat(web): rebuild plan management page with in-app billing"
```

---

### Task 19: Final cross-package verification & docs

**Files:**
- Modify: `documentation/api.md` (add the 6 new Stripe endpoints to the reference)

- [ ] **Step 1: Document the new endpoints**

In `documentation/api.md`, add a row/section for each new endpoint under the Stripe area, mirroring the existing style:

```markdown
### Subscription management (Stripe)

- `GET /api/v1/stripe/billing` — billing overview (current plan, status, next charge, payment method).
- `GET /api/v1/stripe/invoices` — recent invoices with PDF links.
- `POST /api/v1/stripe/subscription/preview` — `{ planId }` → proration preview.
- `POST /api/v1/stripe/subscription/change` — `{ planId }` → switch paid plan (prorated, immediate).
- `POST /api/v1/stripe/subscription/cancel` — cancel at period end.
- `POST /api/v1/stripe/subscription/resume` — undo a scheduled cancellation.
```

- [ ] **Step 2: Run the full quality gate for both packages**

Run: `pnpm --filter @backtrade/types build`
Run: `pnpm --filter @backtrade/api typecheck && pnpm --filter @backtrade/api lint && pnpm --filter @backtrade/api test`
Run: `pnpm --filter @backtrade/web typecheck && pnpm --filter @backtrade/web lint && pnpm --filter @backtrade/web test`
Expected: all PASS.

- [ ] **Step 3: Commit**

```bash
git add documentation/api.md
git commit -m "docs(api): document subscription management endpoints"
```

---

## Self-Review

**1. Spec coverage:**

| Spec requirement | Task |
| --- | --- |
| Live Stripe passthrough; webhook reconciles DB | Tasks 2–5 (service reads Stripe live; no schema change) |
| `GET /stripe/billing` aggregated view-model | Tasks 2, 6 |
| `GET /stripe/invoices` | Tasks 3, 6 |
| `POST /subscription/preview` (proration) | Tasks 4, 6 |
| `POST /subscription/change` (paid↔paid, always_invoice) | Tasks 5, 6 |
| `POST /subscription/cancel` + `/resume` | Tasks 5, 6 |
| Switch-to-Free = cancel; Free→paid = checkout; same-plan guard | Task 13 (`usePlanChange`) + Task 4/5 guards |
| Derived status (free/active/canceling/past_due), no raw IDs | Tasks 2, 10 |
| Shared plan-presentation config reused by both pages | Task 7 |
| Frontend rebuild: hero, picker, payment method, invoices, footer portal link | Tasks 14–18 |
| Quota bar from existing `/sessions` | Tasks 10–11, 14 |
| Free state shown as a plan | Tasks 2 (FREE_OVERVIEW), 14, 15 |
| Per-section skeletons + error; optimistic-ish via query invalidation | Tasks 9, 12, 18 |
| Backend + frontend tests | every task |
| Delete redundant components | Task 18 |

**2. Placeholder scan:** No "TBD"/"implement later". The two spec-flagged uncertainties are resolved with concrete code and isolated for easy adjustment: the proration line-shape lives only in `sumProrationLines` (Task 4, with a verification note), and the quota source is confirmed (`/sessions` + `countActiveSessions`).

**3. Type consistency:** Schema names are defined in Task 1 and referenced identically thereafter (`BillingOverviewResponse`, `Invoice`, `PlanChangePreviewResponse`, `SubscriptionActionResponse`). Service method names (`getBillingOverview`, `listInvoices`, `previewPlanChange`, `changePlan`, `cancelSubscription`, `resumeSubscription`) match controller calls (Task 6) and request-hook URLs (Task 9). `usePlanChange` returns the `PlanChangeDialog` shape consumed by `Plans.tsx` (`title`/`message`/`confirmLabel`/`cancelLabel`/`confirmVariant`/`isLoading`), which matches `ConfirmModal`'s props.
