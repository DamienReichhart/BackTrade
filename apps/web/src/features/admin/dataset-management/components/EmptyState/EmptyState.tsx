import { Button } from "../../../../../components/Button";
import styles from "./EmptyState.module.css";

/**
 * EmptyState component props
 */
interface EmptyStateProps {
    /**
     * Whether filters are currently active
     */
    hasFilters?: boolean;

    /**
     * Callback to clear filters
     */
    onClearFilters?: () => void;

    /**
     * Callback to create a new dataset
     */
    onCreateDataset?: () => void;
}

/**
 * EmptyState component
 *
 * Displays a helpful message when no datasets are found
 */
export function EmptyState({
    hasFilters = false,
    onClearFilters,
    onCreateDataset,
}: EmptyStateProps) {
    if (hasFilters) {
        return (
            <div className={styles.container}>
                <h3 className={styles.title}>No datasets match your filters</h3>
                <p className={styles.description}>
                    Try adjusting your search criteria or clearing the filters
                    to see all datasets.
                </p>
                {onClearFilters && (
                    <Button
                        variant="outline"
                        size="medium"
                        onClick={onClearFilters}
                    >
                        Clear Filters
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>No datasets yet</h3>
            <p className={styles.description}>
                Get started by creating your first dataset. You can upload CSV
                files containing historical trading data for backtesting.
            </p>
            <div className={styles.features}>
                <div className={styles.feature}>
                    <span className={styles.featureIcon}>📁</span>
                    <span className={styles.featureText}>
                        Upload CSV files with OHLCV data
                    </span>
                </div>
            </div>
            {onCreateDataset && (
                <Button
                    variant="primary"
                    size="medium"
                    onClick={onCreateDataset}
                >
                    Create Your First Dataset
                </Button>
            )}
        </div>
    );
}
