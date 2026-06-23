import type { BillingStatus } from "@backtrade/types";
import type { BadgeVariant } from "../../../components/Badge";

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
