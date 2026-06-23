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
            toast.error(err instanceof Error ? err.message : "Action failed");
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
