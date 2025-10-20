import { useGet, usePost, usePut, useDelete } from "../hooks";
import {
  Plan,
  PlanSchema,
  PaginationQuery,
  PaginationQuerySchema,
} from "@backtrade/types";

// Plan Management Hooks
export function usePlans(query?: PaginationQuery) {
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
    outputSchema: PlanSchema.array(),
  });
}

export function usePlan(id: string) {
  return useGet<Plan>(`/plans/${id}`, {
    outputSchema: PlanSchema,
  });
}

export function useCreatePlan() {
  return usePost<Plan, Omit<Plan, "id">>("/plans", {
    outputSchema: PlanSchema,
  });
}

export function useUpdatePlan(id: string) {
  return usePut<Plan, Partial<Omit<Plan, "id">>>(`/plans/${id}`, {
    outputSchema: PlanSchema,
  });
}

export function useDeletePlan(id: string) {
  return useDelete<void>(`/plans/${id}`);
}
