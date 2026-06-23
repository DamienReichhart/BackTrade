# Plan Management Page Refactor Design

**Date:** 2026-06-23
**Status:** Approved
**Scope:** Completely rebuild the logged-in plan management page (`/dashboard/plans`) into a focused, self-sufficient subscription experience: a single source of truth for plan presentation, live billing data from Stripe, and full in-app subscription lifecycle (upgrade/downgrade with proration preview, cancel, resume). Touches `apps/web`, `apps/api`, and `packages/types`.

## Problem

The current page is developer-facing, not user-facing:

- **Leaks internal data** — renders `Plan ID: #2`, `Subscription ID: #5`, raw `Currency: USD`, and lowercase status strings (`active`, `canceled`) directly to users.
- **Three redundant sections** — "Current Subscription", "All Subscriptions" (repeats the current one and dumps canceled history as heavy cards), and "Available Plans". A user has at most one active subscription, so the list is noise.
- **No value shown** — plan cards display only price + plan ID + currency. The rich feature/benefit copy exists, but only in the marketing pricing config; the logged-in page reuses none of it. `max_active_sessions` (the actual differentiator) is never shown.
- **Broken change flow** — with an active subscription, every plan button is disabled behind a notice telling the user to "cancel your current subscription first". There is no real upgrade/downgrade; everything is delegated to the Stripe Customer Portal.

## Goals

- Every user always has a **current plan**. No subscription = **Free** (€0), rendered as the baseline tier — never an empty state.
- **Stripe is the system of record.** New action endpoints call Stripe; the existing `customer.subscription.updated` webhook reconciles the local DB. No raw IDs, currency codes, or lowercase statuses reach the UI.
- **The page is self-sufficient.** The Stripe Customer Portal drops from "the only way to do anything" to a subtle escape hatch for advanced billing (tax/address, editing the card).
- **One source of truth for plan presentation**, reused by both the marketing pricing page and the logged-in page.
- Full in-app lifecycle: **upgrade/downgrade with proration preview, cancel, resume, live billing summary, payment method, invoices.**

## Non-Goals

- **In-app card editing.** Editing/adding a payment method needs Stripe Elements; out of scope. "Update payment method" links to the portal.
- **Advanced billing management** (tax IDs, billing address, currency change) stays in the portal.
- **No data-migration or schema changes.** Billing detail is read live from Stripe (see Architecture Decision). The existing `User.stripe_customer_id` and `Subscription` model are sufficient.
- No changes to the marketing `/pricing` page beyond extracting its plan-presentation config into a shared module.

## Architecture Decision

**Live Stripe passthrough.** New thin backend endpoints call Stripe on demand and return clean view-models. The local DB stays the source of truth for plan/status (reconciled by the existing webhook); ephemeral billing details (next charge, payment method, invoices, proration preview) are fetched live from Stripe per request.

Rationale: minimal schema change, always-accurate billing, and it leverages the webhook sync that already updates `plan_id`, `status`, and `cancel_at_period_end` on `customer.subscription.updated`. Latency is handled by React Query caching on the frontend. A server-side Redis cache (`@backtrade/cache`) is a clean future optimization but is not built now.

## Backend — `apps/api`

All new endpoints live under `/api/v1/stripe`, behind `AuthMiddleware`, and operate **only on the authenticated user's own** Stripe customer/subscription. New functions are added to `apps/api/src/services/stripe/stripe-service.ts`, exposed via `stripe-controller.ts` and `routes/v1/stripe/router.ts`, validated with new Zod schemas in `packages/types/src/requests/stripe.ts`.

### New endpoints

| Endpoint | Stripe call | Returns (view-model) |
| --- | --- | --- |
| `GET /stripe/billing` | upcoming-invoice preview + default payment method | `{ plan, status, currentPeriodEnd, cancelAtPeriodEnd, nextCharge: {amount,currency,date}\|null, paymentMethod: {brand,last4,expMonth,expYear}\|null }` |
| `GET /stripe/invoices` | `invoices.list` | `[{ number, date, amount, currency, status, hostedUrl, pdfUrl }]` |
| `POST /stripe/subscription/preview` `{planId}` | upcoming-invoice preview with target price | `{ amountDueToday, currency, nextChargeAmount, nextChargeDate, isUpgrade }` |
| `POST /stripe/subscription/change` `{planId}` | `subscriptions.update` (`proration_behavior: create_prorations`) | updated billing summary |
| `POST /stripe/subscription/cancel` | `subscriptions.update {cancel_at_period_end:true}` | updated billing summary |
| `POST /stripe/subscription/resume` | `subscriptions.update {cancel_at_period_end:false}` | updated billing summary |

Existing endpoints retained: `POST /stripe/checkout` (Free → paid first purchase), `POST /stripe/portal` (escape hatch), `GET /stripe/checkout/:sessionId` (purchase-success page).

### Derived status

`status` is computed for the UI, never the raw Stripe/DB string:

- `free` — no `stripe_customer_id` or no active subscription.
- `active` — active subscription, not cancelling.
- `canceling` — active but `cancel_at_period_end = true`.
- `past_due` — Stripe subscription status is `past_due`/`unpaid`.

### Plan-change rules

- **Paid ↔ paid (Trader ↔ Expert):** immediate and prorated (`create_prorations`). Upgrades charge the prorated difference now; downgrades issue a prorated credit now. One predictable rule for both directions.
- **Switch to Free:** there is no Free price in Stripe, so this routes through the **cancel** flow (`cancel_at_period_end = true`); the user moves to Free at period end.
- **Free → paid (first purchase):** uses the existing **checkout** redirect (a Stripe customer/subscription may not exist yet).
- **Guard:** reject a change to the plan the user is already on.

For `GET /stripe/billing`, a Free user (no `stripe_customer_id`/active sub) gets a static Free view-model with `nextCharge: null` and `paymentMethod: null` — no Stripe call.

### Authorization & validation

- Every endpoint resolves the customer/subscription from the authenticated user; never trusts a client-supplied customer/subscription id.
- `planId` is validated to be an existing plan.
- Errors map to the project's existing error types (`BadRequestError`, etc.) and standard HTTP codes.

### Implementation note to confirm during planning

The exact Stripe SDK method for the upcoming-invoice/proration preview under the pinned API version `2026-05-27.dahlia` (`invoices.createPreview` vs `invoices.retrieveUpcoming`) is verified against the pinned version before writing endpoint code. This affects three endpoints (`/billing`, `/subscription/preview`, and the next-charge field) but not the overall design.

## Shared plan presentation config

Plan marketing copy is currently duplicated and frontend-only (`apps/web/src/features/pricing/config/pricingConfig.tsx`), and the logged-in page uses none of it. Extract a **single source of truth** keyed by plan `code`:

```
{ code, displayName, tagline, features: string[], tierRank, recommended }
```

- `tierRank`: `FREE=0`, `TRADER=1`, `EXPERT=2` — drives Upgrade vs Downgrade vs Current button labels and the `isUpgrade` flag.
- **Price / currency / `max_active_sessions` come from the API** (`GET /plans`, authoritative).
- **Features / copy / rank come from config.**

Both the marketing pricing page and the logged-in page consume this module, fixing the duplication and the "no features shown when logged in" bug. Location: a shared web config module (e.g. `apps/web/src/config/plans.tsx`) imported by both features.

## Frontend — `apps/web/src/features/plans`

Rebuild the feature module following project conventions (component-per-directory, named exports, CSS Modules with design tokens, hooks own logic).

**Delete** (replaced/redundant): `CurrentSubscription/`, `SubscriptionList/`, `SubscriptionCard/`, `PlanCard/`, `PlanList/`, and the old `usePlansData`/`useSubscriptionManagement` where superseded.
**Keep:** `PurchaseSuccess/`.

```
features/plans/
  Plans.tsx                      # orchestrates stacked sections + per-section loading/error
  Plans.module.css
  index.tsx
  hooks/
    useBillingOverview.tsx       # GET /stripe/billing
    useInvoices.tsx              # GET /stripe/invoices
    usePlanChange.tsx            # preview + change + dialog state
    useSubscriptionLifecycle.tsx # cancel / resume (optimistic)
    usePlanQuota.tsx             # active-session count vs max_active_sessions
    index.tsx
  components/
    PlanSummary/                 # the hero
    PlanPicker/
      PlanOptionCard/
    ChangePlanDialog/            # proration preview + confirm
    PaymentMethod/
    InvoiceList/
      InvoiceRow/
    index.tsx
  utils/
    plan.ts                      # tier rank, label helpers
    billing.ts                   # status derivation, money/date formatting
    index.ts
```

New API hooks in `apps/web/src/api/hooks/requests/stripe.tsx`: `useBillingOverview`, `useInvoices`, `usePreviewPlanChange`, `useChangePlan`, `useCancelSubscription`, `useResumeSubscription` — all built on the `useGet`/`usePost` + Zod `inputSchema`/`outputSchema` pattern, against new schemas in `@backtrade/types`.

## Page UX (stacked sections)

1. **Plan summary hero** (always shown) — plan display name + status badge (Active / Free / *Cancels Jul 14* / Past due), price line ("€19 / month" or "Free"), renewal/cancellation line ("Renews Jul 14" or "Cancels Jul 14 — moves to Free"), a **quota bar** ("Sessions 7 / 10"), and contextual primary actions:
   - Free → *Upgrade* (scrolls to picker)
   - Active → *Change plan* + *Cancel*
   - Canceling → *Resume subscription*
   - Past due → *Update payment*
2. **Change plan** (`PlanPicker`) — three cards (Free / Trader / Expert) merged from config + API; current plan marked; buttons labeled Upgrade / Downgrade / Switch to Free / Current by `tierRank`. Selecting opens the dialog.
3. **Change plan dialog** — fetches the proration preview, shows "You'll pay €X today, then €49/mo from Jul 14" (upgrade) or the downgrade credit; confirm → change → toast → invalidate billing/invoices queries.
4. **Payment method** — `brand ····last4` + expiry; "Update payment method" → portal. Hidden/empty for Free.
5. **Invoices** — date / amount / status badge / PDF download (`hostedUrl`/`pdfUrl`); "No invoices yet" empty state for Free.
6. **Footer link** — subtle "Manage billing in Stripe" escape hatch.

### Quota bar

Feasible with existing endpoints — no new backend work. `useSessions()` (`GET /sessions`) returns full session objects; count those where `session_status !== "ARCHIVED"` (reusing the existing `isSessionActive` helper: active = `RUNNING` or `PAUSED`) and render against `plan.max_active_sessions`.

## States & error handling

- **Loading:** per-section skeletons, not a full-page spinner.
- **Error:** per-section error + retry; the page shell still renders.
- **Free user:** hero shows Free; picker shows upgrades; payment + invoices show empty states.
- **Optimistic updates** for cancel/resume, reconciled by refetch (webhook updates the DB shortly after).
- **Action errors:** toast + revert optimistic state.
- **Preview failure:** dialog falls back to "exact proration is shown by Stripe at confirmation" rather than blocking.

## Testing

- **Backend:** unit tests per new service function (mocked Stripe SDK); controller request validation; own-customer authorization; each plan-change rule branch (paid↔paid, switch-to-Free, Free→paid, same-plan guard).
- **Frontend:** hook tests with mocked API; component state-matrix tests (`free` / `active` / `canceling` / `past_due`); dialog proration-preview rendering; tier-rank button-label logic; quota-bar counting.
- **Verification:** host pnpm `typecheck` / `lint` / `prettier --check` / `test` for `@backtrade/web` and affected packages.
