import { useGet } from "../hooks/useGet";
import { Health, HealthSchema } from "@backtrade/types";

export function useHealth() {
  return useGet<Health>("/health", {
    outputSchema: HealthSchema,
  });
}
