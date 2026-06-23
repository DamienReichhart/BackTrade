import { useRef, type RefObject } from "react";
import type { BillingOverviewResponse, Invoice, Plan } from "@backtrade/types";
import { ErrorState } from "../dashboard/components/ErrorState";
import { ConfirmModal } from "../../components/ConfirmModal";
import { Skeleton } from "../../components/Skeleton";
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
 * payment method, and invoices. The page shell renders immediately; the
 * billing overview gates the interactive sections, while invoices load and
 * fail independently.
 */
export function Plans() {
    const {
        overview,
        invoices,
        isOverviewLoading,
        overviewError,
        isInvoicesLoading,
        invoicesError,
    } = usePlansPageData();
    const { data: plansData } = usePlans();
    const { execute: openPortal, isLoading: isOpeningPortal } =
        useCreatePortalSession();
    const pickerRef = useRef<HTMLDivElement>(null);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Plans &amp; billing</h1>
            </header>

            {isOverviewLoading || !overview ? (
                <div className={styles.content}>
                    <Skeleton height={200} />
                    <Skeleton height={280} />
                </div>
            ) : overviewError ? (
                <div className={styles.content}>
                    <ErrorState error={overviewError} />
                </div>
            ) : (
                <PlansContent
                    overview={overview}
                    invoices={invoices}
                    isInvoicesLoading={isInvoicesLoading}
                    invoicesError={invoicesError}
                    plans={plansData ?? []}
                    openPortal={openPortal}
                    isOpeningPortal={isOpeningPortal}
                    pickerRef={pickerRef}
                />
            )}
        </div>
    );
}

interface PlansContentProps {
    overview: BillingOverviewResponse;
    invoices: Invoice[];
    isInvoicesLoading: boolean;
    invoicesError: Error | null;
    plans: Plan[];
    openPortal: ReturnType<typeof useCreatePortalSession>["execute"];
    isOpeningPortal: boolean;
    pickerRef: RefObject<HTMLDivElement | null>;
}

/**
 * Rendered once the overview is loaded so plan-change hooks always
 * receive a defined overview.
 */
function PlansContent({
    overview,
    invoices,
    isInvoicesLoading,
    invoicesError,
    plans,
    openPortal,
    isOpeningPortal,
    pickerRef,
}: PlansContentProps) {
    const planChange = usePlanChange(overview);
    const { resume, isResuming } = useSubscriptionLifecycle();

    const isFree = overview.status === "free";

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
                    plans={plans}
                    overview={overview}
                    onSelectPlan={planChange.selectPlan}
                    disabled={busy}
                />
            </div>

            {!isFree && (
                <PaymentMethod
                    paymentMethod={overview.paymentMethod}
                    onManage={goToPortal}
                    disabled={busy}
                />
            )}

            <InvoiceList
                invoices={invoices}
                isLoading={isInvoicesLoading}
                error={invoicesError}
            />

            {!isFree && (
                <button
                    type="button"
                    className={styles.portalLink}
                    onClick={goToPortal}
                    disabled={busy}
                >
                    Manage billing in Stripe
                </button>
            )}

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
