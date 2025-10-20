import { ComparisonRow } from "../../config/pricingConfig";
import styles from "./ComparisonTable.module.css";

/**
 * ComparisonTable props
 */
interface ComparisonTableProps {
  data: ComparisonRow[];
}

/**
 * Format cell value for display
 */
function formatCellValue(value: string | boolean): string {
  if (typeof value === "boolean") {
    return value ? "✓" : "Not included";
  }
  return value;
}

/**
 * Get cell class based on value
 */
function getCellClass(value: string | boolean): string {
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

/**
 * ComparisonTable component
 *
 * Displays detailed comparison table of pricing plans
 */
export function ComparisonTable({ data }: ComparisonTableProps) {
  return (
    <section className={styles.comparisonSection}>
      <div className={styles.container}>
        <h2 className={styles.title}>Compare plans</h2>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.headerRow}>
                <th className={styles.headerCell}>FEATURE</th>
                <th className={styles.headerCell}>Free</th>
                <th className={styles.headerCell}>Trader</th>
                <th className={styles.headerCell}>Expert</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index} className={styles.dataRow}>
                  <td className={styles.featureCell}>{row.feature}</td>
                  <td
                    className={`${styles.dataCell} ${getCellClass(row.free)}`}
                  >
                    {formatCellValue(row.free)}
                  </td>
                  <td
                    className={`${styles.dataCell} ${getCellClass(row.trader)}`}
                  >
                    {formatCellValue(row.trader)}
                  </td>
                  <td
                    className={`${styles.dataCell} ${getCellClass(row.expert)}`}
                  >
                    {formatCellValue(row.expert)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className={styles.notes}>
          <strong>Notes:</strong> Active = Running + Paused. The engine blocks
          new starts when the quota is reached. One instrument per session. No
          session continuation while away from the trading page.
        </p>
      </div>
    </section>
  );
}
