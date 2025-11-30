import { type ComparisonTableProps } from "../../types";
import styles from "./ComparisonTable.module.css";
import { formatCellValue, getCellClass } from "../../utils";

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
                    className={`${styles.dataCell} ${getCellClass(row.free, {
                      included: styles.included,
                      notIncluded: styles.notIncluded,
                      highlight: styles.highlight,
                    })}`}
                  >
                    {formatCellValue(row.free)}
                  </td>
                  <td
                    className={`${styles.dataCell} ${getCellClass(row.trader, {
                      included: styles.included,
                      notIncluded: styles.notIncluded,
                      highlight: styles.highlight,
                    })}`}
                  >
                    {formatCellValue(row.trader)}
                  </td>
                  <td
                    className={`${styles.dataCell} ${getCellClass(row.expert, {
                      included: styles.included,
                      notIncluded: styles.notIncluded,
                      highlight: styles.highlight,
                    })}`}
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
