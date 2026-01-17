import { useGet, usePost, usePatch, useDelete } from "..";
import {
    PlanSchema,
    PlanListResponseSchema,
    CreatePlanRequestSchema,
    UpdatePlanRequestSchema,
    type SearchQuery,
} from "@backtrade/types";
import { buildUrlWithParams } from "../utils/url-params";

/**
 * Plan Management API Hooks
 * Schemas are defined once and automatically applied
 */

export function usePlans(query?: SearchQuery) {
    const url = buildUrlWithParams("/plans", query);
    return useGet(url, PlanListResponseSchema);
}

export function usePlan(id: string) {
    return useGet(`/plans/${id}`, PlanSchema, { enabled: !!id });
}

export function useCreatePlan() {
    return usePost("/plans", CreatePlanRequestSchema, PlanSchema);
}

export function useUpdatePlan(id: string) {
    return usePatch(`/plans/${id}`, UpdatePlanRequestSchema, PlanSchema);
}

export function useDeletePlan(id: string) {
    return useDelete(`/plans/${id}`);
}
