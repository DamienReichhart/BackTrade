import { useRef, type RefObject } from "react";
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

    return (
        <PlansContent
            overview={overview}
            invoices={invoices}
            plans={plansData ?? []}
            openPortal={openPortal}
            isOpeningPortal={isOpeningPortal}
            pickerRef={pickerRef}
        />
    );
}

interface PlansContentProps {
    overview: NonNullable<ReturnType<typeof usePlansPageData>["overview"]>;
    invoices: ReturnType<typeof usePlansPageData>["invoices"];
    plans: ReturnType<typeof usePlans>["data"];
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
