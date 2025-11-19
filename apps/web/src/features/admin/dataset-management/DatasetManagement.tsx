import { useDatasetManagement } from "./hooks";
import { DatasetTable } from "./components/DatasetTable";
import { Button } from "../../../components/Button";
import styles from "./DatasetManagement.module.css";

/**
 * Dataset Management page component
 *
 * Admin page for managing datasets with sorting
 */
export function DatasetManagement() {
  const {
    // State
    sortField,
    sortOrder,
    datasets,
    isLoading,
    error,

    // Handlers
    handleSort,
    handleBackToAdmin,
  } = useDatasetManagement();

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>Dataset Management</h1>
          <Button variant="outline" onClick={handleBackToAdmin}>
            Back to Admin
          </Button>
        </div>
        <p className={styles.subtitle}>
          Manage datasets, view statistics, and monitor data uploads
        </p>
      </header>

      {/* Dataset Table */}
      <DatasetTable
        datasets={datasets}
        isLoading={isLoading}
        error={error}
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={handleSort}
      />
    </div>
  );
}
