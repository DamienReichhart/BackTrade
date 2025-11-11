import { useGet, usePost, usePut, useDelete } from "..";
import {
  PlanSchema,
  CreatePlanRequestSchema,
  UpdatePlanRequestSchema,
  EmptyResponseSchema,
  type Plan,
  type SearchQuery,
} from "@backtrade/types";
import { z } from "zod";

/**
 * Plan Management API Hooks
 * Schemas are defined once and automatically applied
 */

export function usePlans(query?: SearchQuery) {
  const searchParams = new URLSearchParams();
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
  }

  const url = query ? `/plans?${searchParams.toString()}` : "/plans";

  return useGet<Plan[]>(url, {
    outputSchema: z.array(PlanSchema),
  });
}

export function usePlan(id: string) {
  return useGet(`/plans/${id}`, {
    outputSchema: PlanSchema,
  });
}

export function useCreatePlan() {
  return usePost("/plans", {
    inputSchema: CreatePlanRequestSchema,
    outputSchema: PlanSchema,
  });
}

export function useUpdatePlan(id: string) {
  return usePut(`/plans/${id}`, {
    inputSchema: UpdatePlanRequestSchema,
    outputSchema: PlanSchema,
  });
}

export function useDeletePlan(id: string) {
  return useDelete(`/plans/${id}`, {
    outputSchema: EmptyResponseSchema,
  });
}
