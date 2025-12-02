import { useMemo } from "react";
import type { Plan } from "@backtrade/types";

/**
 * Hook to find plan by ID from plans array
 *
 * @param plans - Array of plans
 * @param planId - Plan ID to find
 * @returns Found plan or undefined
 */
export function usePlanLookup(plans: Plan[], planId: number) {
    return useMemo(() => {
        return plans.find((p) => p.id === planId);
    }, [plans, planId]);
}
