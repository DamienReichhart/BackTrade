import { useGet } from "..";
import { HealthSchema } from "@backtrade/types";

/**
 * Health Check API Hook
 * Schemas are defined once and automatically applied
 */

export function useHealth() {
  return useGet("/health", {
    outputSchema: HealthSchema,
  });
}
