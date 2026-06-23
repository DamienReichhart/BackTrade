import type { BillingOverviewResponse } from "@backtrade/types";
import { Badge } from "../../../../components/Badge";
import { Button } from "../../../../components/Button";
import { usePlanQuota } from "../../hooks/usePlanQuota";
import { formatMoney, statusBadgeVariant, statusLabel } from "../../utils";
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
