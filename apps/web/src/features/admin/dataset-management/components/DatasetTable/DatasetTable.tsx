import type { Dataset } from "@backtrade/types";
import type { SortField, SortOrder } from "../../hooks";
import { formatDate, formatDateTime } from "@backtrade/utils";
import { getSortIndicator } from "./utils/table";
import { getStatusBadgeClassName, getStatusLabel } from "./utils/formatting";
import styles from "./DatasetTable.module.css";

/**
 * Dataset Table component props
 */
interface DatasetTableProps {
  /**
   * List of datasets to display
   */
  datasets: Dataset[];

  /**
   * Whether data is loading
   */
  isLoading?: boolean;

  /**
   * Error object if request failed
   */
  error?: Error | null;

  /**
   * Current sort field
   */
  sortField: SortField;

  /**
   * Current sort order
   */
  sortOrder: SortOrder;

  /**
   * Callback when sort field is clicked
   */
  onSort: (field: SortField) => void;
}

/**
 * Dataset Table component
 *
 * Displays datasets in a sortable table
 */
export function DatasetTable({
  datasets,
  isLoading = false,
  error = null,
  sortField,
  sortOrder,
  onSort,
}: DatasetTableProps) {
  return (
    <div className={styles.card}>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th
                className={styles.sortableHeader}
                onClick={() => onSort("id")}
              >
                ID {getSortIndicator("id", sortField, sortOrder)}
              </th>
              <th
                className={styles.sortableHeader}
                onClick={() => onSort("instrument_id")}
              >
                Instrument ID{" "}
                {getSortIndicator("instrument_id", sortField, sortOrder)}
              </th>
              <th
                className={styles.sortableHeader}
                onClick={() => onSort("timeframe")}
              >
                Timeframe {getSortIndicator("timeframe", sortField, sortOrder)}
              </th>
              <th
                className={styles.sortableHeader}
                onClick={() => onSort("file_name")}
              >
                File Name {getSortIndicator("file_name", sortField, sortOrder)}
              </th>
              <th
                className={styles.sortableHeader}
                onClick={() => onSort("records_count")}
              >
                Records{" "}
                {getSortIndicator("records_count", sortField, sortOrder)}
              </th>
              <th
                className={styles.sortableHeader}
                onClick={() => onSort("is_active")}
              >
                Status {getSortIndicator("is_active", sortField, sortOrder)}
              </th>
              <th
                className={styles.sortableHeader}
                onClick={() => onSort("start_ts")}
              >
                Start Date {getSortIndicator("start_ts", sortField, sortOrder)}
              </th>
              <th
                className={styles.sortableHeader}
                onClick={() => onSort("end_ts")}
              >
                End Date {getSortIndicator("end_ts", sortField, sortOrder)}
              </th>
              <th
                className={styles.sortableHeader}
                onClick={() => onSort("uploaded_at")}
              >
                Uploaded {getSortIndicator("uploaded_at", sortField, sortOrder)}
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td className={styles.empty} colSpan={9}>
                  Loading datasets...
                </td>
              </tr>
            )}
            {error && (
              <tr>
                <td className={styles.error} colSpan={9}>
                  Error loading datasets: {error.message}
                </td>
              </tr>
            )}
            {!isLoading && !error && datasets.length === 0 && (
              <tr>
                <td className={styles.empty} colSpan={9}>
                  No datasets found
                </td>
              </tr>
            )}
            {!isLoading &&
              !error &&
              datasets.map((dataset) => (
                <tr key={dataset.id} className={styles.row}>
                  <td>{dataset.id}</td>
                  <td>{dataset.instrument_id}</td>
                  <td>
                    <span className={styles.timeframeBadge}>
                      {dataset.timeframe}
                    </span>
                  </td>
                  <td className={styles.fileNameCell}>{dataset.file_name}</td>
                  <td className={styles.recordsCell}>
                    {dataset.records_count.toLocaleString()}
                  </td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${
                        styles[getStatusBadgeClassName(dataset.is_active)]
                      }`}
                    >
                      {getStatusLabel(dataset.is_active)}
                    </span>
                  </td>
                  <td className={styles.dateCell}>
                    {formatDate(dataset.start_ts)}
                  </td>
                  <td className={styles.dateCell}>
                    {formatDate(dataset.end_ts)}
                  </td>
                  <td className={styles.dateCell}>
                    {formatDateTime(dataset.uploaded_at)}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
