import { useGet } from "../hooks";
import { Health, HealthSchema } from "@backtrade/types";

export function useHealth() {
  return useGet<Health>("/health", {
    outputSchema: HealthSchema,
  });
}
