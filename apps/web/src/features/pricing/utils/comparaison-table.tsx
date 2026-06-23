import { type ReactNode } from "react";
import { Check } from "lucide-react";
import { Icon } from "../../../components/Icon";
import { type ComparisonTableCellStyles } from "../types";

/**
 * Format cell value for display
 */
export function formatCellValue(value: string | boolean): ReactNode {
    if (typeof value === "boolean") {
        return value ? (
            <Icon icon={Check} size="sm" label="Included" />
        ) : (
            "Not included"
        );
    }
    return value;
}

/**
 * Get cell class based on value
 */
export function getCellClass(
    value: string | boolean,
    styles: ComparisonTableCellStyles
): string {
    if (typeof value === "boolean") {
        return value ? styles.included : styles.notIncluded;
    }

    const lowerValue = value.toLowerCase();
    if (lowerValue.includes("not included")) {
        return styles.notIncluded;
    }
    if (
        lowerValue.includes("immediate market") ||
        lowerValue.includes("fixed spread")
    ) {
        return styles.highlight;
    }

    return "";
}
