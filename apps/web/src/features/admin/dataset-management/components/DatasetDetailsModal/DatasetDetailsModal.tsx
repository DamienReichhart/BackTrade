import type { Dataset } from "@backtrade/types";
import { formatDate, formatDateTime } from "@backtrade/utils";
import { Button } from "../../../../../components/Button";
import { useModalBehavior } from "../../../../../hooks/useModalBehavior";
import styles from "./DatasetDetailsModal.module.css";

/**
 * DatasetDetailsModal component props
 */
interface DatasetDetailsModalProps {
    /**
     * Whether the modal is open
     */
    isOpen: boolean;

    /**
     * Dataset to display details for
     */
    dataset: Dataset | null;

    /**
     * Callback when modal should close
     */
    onClose: () => void;

    /**
     * Callback when delete is requested
     */
    onDelete?: () => void;

    /**
     * Callback when upload is requested
     */
    onUpload?: () => void;
}

/**
 * Detail item component for displaying a label-value pair
 */
function DetailItem({
    label,
    value,
    variant,
}: {
    label: string;
    value: React.ReactNode;
    variant?: "default" | "code" | "badge";
}) {
    return (
        <div className={styles.detailItem}>
            <span className={styles.detailLabel}>{label}</span>
            <span
                className={`${styles.detailValue} ${variant ? styles[variant] : ""}`}
            >
                {value}
            </span>
        </div>
    );
}

/**
 * DatasetDetailsModal component
 *
 * Displays detailed information about a dataset
 */
export function DatasetDetailsModal({
    isOpen,
    dataset,
    onClose,
    onDelete,
    onUpload,
}: DatasetDetailsModalProps) {
    useModalBehavior(isOpen, onClose);

    if (!isOpen || !dataset) return null;

    const hasFile = !!dataset.file_name;
    const uploadStatus = hasFile ? "Uploaded" : "Pending Upload";
    const statusClass = hasFile ? styles.uploadedBadge : styles.pendingBadge;

    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div
                className={styles.modal}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="dataset-details-title"
            >
                <div className={styles.header}>
                    <div className={styles.headerContent}>
                        <h2 id="dataset-details-title" className={styles.title}>
                            Dataset Details
                        </h2>
                        <span
                            className={`${styles.statusBadge} ${statusClass}`}
                        >
                            {uploadStatus}
                        </span>
                    </div>
                    <button
                        className={styles.closeButton}
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        ×
                    </button>
                </div>

                <div className={styles.content}>
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>
                            Basic Information
                        </h3>
                        <div className={styles.detailGrid}>
                            <DetailItem
                                label="Dataset ID"
                                value={`#${dataset.id}`}
                                variant="code"
                            />
                            <DetailItem
                                label="Instrument ID"
                                value={dataset.instrument_id}
                            />
                            <DetailItem
                                label="Timeframe"
                                value={dataset.timeframe}
                                variant="badge"
                            />
                            <DetailItem
                                label="File Name"
                                value={dataset.file_name ?? "No file uploaded"}
                            />
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Data Statistics</h3>
                        <div className={styles.detailGrid}>
                            <DetailItem
                                label="Records Count"
                                value={
                                    dataset.records_count
                                        ? dataset.records_count.toLocaleString()
                                        : "—"
                                }
                            />
                            <DetailItem
                                label="Data Start"
                                value={
                                    dataset.start_time
                                        ? formatDate(dataset.start_time)
                                        : "—"
                                }
                            />
                            <DetailItem
                                label="Data End"
                                value={
                                    dataset.end_time
                                        ? formatDate(dataset.end_time)
                                        : "—"
                                }
                            />
                            <DetailItem
                                label="Date Range"
                                value={
                                    dataset.start_time && dataset.end_time
                                        ? `${formatDate(dataset.start_time)} → ${formatDate(dataset.end_time)}`
                                        : "—"
                                }
                            />
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Timestamps</h3>
                        <div className={styles.detailGrid}>
                            <DetailItem
                                label="Created At"
                                value={
                                    dataset.created_at
                                        ? formatDateTime(dataset.created_at)
                                        : "—"
                                }
                            />
                            <DetailItem
                                label="Updated At"
                                value={
                                    dataset.updated_at
                                        ? formatDateTime(dataset.updated_at)
                                        : "—"
                                }
                            />
                            <DetailItem
                                label="Uploaded At"
                                value={
                                    dataset.uploaded_at
                                        ? formatDateTime(dataset.uploaded_at)
                                        : "Not yet uploaded"
                                }
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.footer}>
                    <div className={styles.footerLeft}>
                        {onDelete && (
                            <Button
                                variant="ghost"
                                size="medium"
                                onClick={onDelete}
                                className={styles.deleteButton}
                            >
                                Delete Dataset
                            </Button>
                        )}
                    </div>
                    <div className={styles.footerRight}>
                        <Button
                            variant="outline"
                            size="medium"
                            onClick={onClose}
                        >
                            Close
                        </Button>
                        {onUpload && (
                            <Button
                                variant="primary"
                                size="medium"
                                onClick={onUpload}
                            >
                                {hasFile ? "Re-upload File" : "Upload File"}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
