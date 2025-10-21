/**
 * Format cell value for display
 */
export function formatCellValue(value) {
  if (typeof value === "boolean") {
    return value ? "✓" : "Not included";
  }
  return value;
}

/**
 * Get cell class based on value
 */
export function getCellClass(value, styles) {
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
