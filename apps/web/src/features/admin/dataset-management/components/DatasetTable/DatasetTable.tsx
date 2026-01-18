import type { Dataset } from "@backtrade/types";
import type { SortField, SortOrder } from "../../hooks";
import { formatDate, formatDateTime } from "@backtrade/utils";
import { getSortIndicator } from "./utils/table";
import { FileUploadButton } from "../FileUploadButton";
import { Button } from "../../../../../components/Button";
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

    /**
     * Callback when file upload is successful
     */
    onFileUploadSuccess?: () => void;

    /**
     * Callback when a row is clicked to view details
     */
    onViewDetails?: (dataset: Dataset) => void;

    /**
     * Callback when delete button is clicked
     */
    onDelete?: (datasetId: number) => void;
}

/**
 * Skeleton row component for loading state
 */
function SkeletonRow() {
    return (
        <tr className={styles.skeletonRow}>
            <td>
                <div className={styles.skeleton} style={{ width: "40px" }} />
            </td>
            <td>
                <div className={styles.skeleton} style={{ width: "60px" }} />
            </td>
            <td>
                <div
                    className={`${styles.skeleton} ${styles.skeletonBadge}`}
                    style={{ width: "50px" }}
                />
            </td>
            <td>
                <div className={styles.skeleton} style={{ width: "120px" }} />
            </td>
            <td>
                <div className={styles.skeleton} style={{ width: "80px" }} />
            </td>
            <td>
                <div className={styles.skeleton} style={{ width: "90px" }} />
            </td>
            <td>
                <div className={styles.skeleton} style={{ width: "90px" }} />
            </td>
            <td>
                <div className={styles.skeleton} style={{ width: "130px" }} />
            </td>
            <td>
                <div className={styles.skeleton} style={{ width: "70px" }} />
            </td>
        </tr>
    );
}

/**
 * Status badge component
 */
function StatusBadge({ hasFile }: { hasFile: boolean }) {
    return (
        <span
            className={`${styles.statusBadge} ${hasFile ? styles.uploadedBadge : styles.pendingBadge}`}
        >
            {hasFile ? "Uploaded" : "Pending"}
        </span>
    );
}

/**
 * Dataset Table component
 *
 * Displays datasets in a sortable table with enhanced visuals
 */
export function DatasetTable({
    datasets,
    isLoading = false,
    error = null,
    sortField,
    sortOrder,
    onSort,
    onFileUploadSuccess,
    onViewDetails,
    onDelete,
}: DatasetTableProps) {
    const handleRowClick = (dataset: Dataset, e: React.MouseEvent) => {
        // Don't trigger if clicking on buttons or file input
        const target = e.target as HTMLElement;
        if (
            target.closest("button") ||
            target.closest("input") ||
            target.closest(`.${styles.actionsCell}`)
        ) {
            return;
        }
        onViewDetails?.(dataset);
    };

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
                                <span className={styles.headerContent}>
                                    ID
                                    <span className={styles.sortIcon}>
                                        {getSortIndicator(
                                            "id",
                                            sortField,
                                            sortOrder
                                        )}
                                    </span>
                                </span>
                            </th>
                            <th
                                className={styles.sortableHeader}
                                onClick={() => onSort("instrument_id")}
                            >
                                <span className={styles.headerContent}>
                                    Instrument
                                    <span className={styles.sortIcon}>
                                        {getSortIndicator(
                                            "instrument_id",
                                            sortField,
                                            sortOrder
                                        )}
                                    </span>
                                </span>
                            </th>
                            <th
                                className={styles.sortableHeader}
                                onClick={() => onSort("timeframe")}
                            >
                                <span className={styles.headerContent}>
                                    Timeframe
                                    <span className={styles.sortIcon}>
                                        {getSortIndicator(
                                            "timeframe",
                                            sortField,
                                            sortOrder
                                        )}
                                    </span>
                                </span>
                            </th>
                            <th
                                className={styles.sortableHeader}
                                onClick={() => onSort("file_name")}
                            >
                                <span className={styles.headerContent}>
                                    File Name
                                    <span className={styles.sortIcon}>
                                        {getSortIndicator(
                                            "file_name",
                                            sortField,
                                            sortOrder
                                        )}
                                    </span>
                                </span>
                            </th>
                            <th
                                className={styles.sortableHeader}
                                onClick={() => onSort("records_count")}
                            >
                                <span className={styles.headerContent}>
                                    Records
                                    <span className={styles.sortIcon}>
                                        {getSortIndicator(
                                            "records_count",
                                            sortField,
                                            sortOrder
                                        )}
                                    </span>
                                </span>
                            </th>
                            <th
                                className={styles.sortableHeader}
                                onClick={() => onSort("start_time")}
                            >
                                <span className={styles.headerContent}>
                                    Start Date
                                    <span className={styles.sortIcon}>
                                        {getSortIndicator(
                                            "start_time",
                                            sortField,
                                            sortOrder
                                        )}
                                    </span>
                                </span>
                            </th>
                            <th
                                className={styles.sortableHeader}
                                onClick={() => onSort("end_time")}
                            >
                                <span className={styles.headerContent}>
                                    End Date
                                    <span className={styles.sortIcon}>
                                        {getSortIndicator(
                                            "end_time",
                                            sortField,
                                            sortOrder
                                        )}
                                    </span>
                                </span>
                            </th>
                            <th
                                className={styles.sortableHeader}
                                onClick={() => onSort("uploaded_at")}
                            >
                                <span className={styles.headerContent}>
                                    Status
                                    <span className={styles.sortIcon}>
                                        {getSortIndicator(
                                            "uploaded_at",
                                            sortField,
                                            sortOrder
                                        )}
                                    </span>
                                </span>
                            </th>
                            <th className={styles.actionsHeader}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading &&
                            [...Array(5)].map((_, i) => (
                                <SkeletonRow key={i} />
                            ))}

                        {error && !isLoading && (
                            <tr>
                                <td className={styles.errorCell} colSpan={9}>
                                    <div className={styles.errorContent}>
                                        <span className={styles.errorText}>
                                            Error loading datasets:{" "}
                                            {error.message}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="small"
                                            onClick={() =>
                                                window.location.reload()
                                            }
                                        >
                                            Retry
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        )}

                        {!isLoading &&
                            !error &&
                            datasets.map((dataset) => (
                                <tr
                                    key={dataset.id}
                                    className={`${styles.row} ${onViewDetails ? styles.clickableRow : ""}`}
                                    onClick={(e) => handleRowClick(dataset, e)}
                                >
                                    <td className={styles.idCell}>
                                        <span className={styles.idBadge}>
                                            #{dataset.id}
                                        </span>
                                    </td>
                                    <td className={styles.instrumentCell}>
                                        {dataset.instrument_id}
                                    </td>
                                    <td>
                                        <span className={styles.timeframeBadge}>
                                            {dataset.timeframe}
                                        </span>
                                    </td>
                                    <td className={styles.fileNameCell}>
                                        {dataset.file_name ? (
                                            <span
                                                className={styles.fileName}
                                                title={dataset.file_name}
                                            >
                                                {dataset.file_name}
                                            </span>
                                        ) : (
                                            <span className={styles.noFile}>
                                                —
                                            </span>
                                        )}
                                    </td>
                                    <td className={styles.recordsCell}>
                                        {dataset.records_count ? (
                                            <span
                                                className={styles.recordsValue}
                                            >
                                                {dataset.records_count.toLocaleString()}
                                            </span>
                                        ) : (
                                            <span className={styles.noData}>
                                                —
                                            </span>
                                        )}
                                    </td>
                                    <td className={styles.dateCell}>
                                        {dataset.start_time
                                            ? formatDate(dataset.start_time)
                                            : "—"}
                                    </td>
                                    <td className={styles.dateCell}>
                                        {dataset.end_time
                                            ? formatDate(dataset.end_time)
                                            : "—"}
                                    </td>
                                    <td className={styles.statusCell}>
                                        <StatusBadge
                                            hasFile={!!dataset.file_name}
                                        />
                                        {dataset.uploaded_at && (
                                            <span className={styles.uploadedAt}>
                                                {formatDateTime(
                                                    dataset.uploaded_at
                                                )}
                                            </span>
                                        )}
                                    </td>
                                    <td className={styles.actionsCell}>
                                        <div className={styles.actions}>
                                            <FileUploadButton
                                                datasetId={dataset.id}
                                                hasFile={!!dataset.file_name}
                                                onSuccess={onFileUploadSuccess}
                                            />
                                            {onDelete && (
                                                <Button
                                                    variant="ghost"
                                                    size="small"
                                                    onClick={() =>
                                                        onDelete(dataset.id)
                                                    }
                                                    className={
                                                        styles.deleteButton
                                                    }
                                                    aria-label="Delete dataset"
                                                >
                                                    <svg
                                                        width="16"
                                                        height="16"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <path d="M3 6h18" />
                                                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                                        <line
                                                            x1="10"
                                                            x2="10"
                                                            y1="11"
                                                            y2="17"
                                                        />
                                                        <line
                                                            x1="14"
                                                            x2="14"
                                                            y1="11"
                                                            y2="17"
                                                        />
                                                    </svg>
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
