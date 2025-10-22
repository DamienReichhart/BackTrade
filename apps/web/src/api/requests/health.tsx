import { useGet } from "../hooks";
import { type Health, HealthSchema } from "@backtrade/types";

export function useHealth() {
  return useGet<Health>("/health", {
    outputSchema: HealthSchema,
  });
}
