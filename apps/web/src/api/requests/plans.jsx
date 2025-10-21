import { useGet, usePost, usePut, useDelete } from "../hooks/index.jsx";

// Plan Management Hooks
export function usePlans(query) {
  const searchParams = new URLSearchParams();
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
  }

  const url = query ? `/plans?${searchParams.toString()}` : "/plans";

  return useGet(url);
}

export function usePlan(id) {
  return useGet(`/plans/${id}`);
}

export function useCreatePlan() {
  return usePost("/plans");
}

export function useUpdatePlan(id) {
  return usePut(`/plans/${id}`);
}

export function useDeletePlan(id) {
  return useDelete(`/plans/${id}`);
}
