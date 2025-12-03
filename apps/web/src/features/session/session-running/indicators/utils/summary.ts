import { getIndicatorDefinition, type IndicatorConfig } from "../toolkit";

/**
 * Produce a human-readable summary for an indicator instance
 */
export function getIndicatorSummary(indicator: IndicatorConfig): string {
    const definition = getIndicatorDefinition(indicator.type);
    return definition.summary(indicator as never);
}
