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
