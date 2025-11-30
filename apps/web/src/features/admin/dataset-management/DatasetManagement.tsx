import { useState } from "react";
import { useDatasetManagement } from "./hooks";
import { DatasetTable, CreateDatasetModal } from "./components";
import { Button } from "../../../components/Button";
import styles from "./DatasetManagement.module.css";

/**
 * Dataset Management page component
 *
 * Admin page for managing datasets with sorting
 */
export function DatasetManagement() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
    refetchDatasets,
  } = useDatasetManagement();

  const handleCreateDataset = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleDatasetCreated = () => {
    refetchDatasets();
  };

  const handleFileUploadSuccess = () => {
    refetchDatasets();
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>Dataset Management</h1>
          <div className={styles.headerActions}>
            <Button variant="primary" onClick={handleCreateDataset}>
              Create Dataset
            </Button>
            <Button variant="outline" onClick={handleBackToAdmin}>
              Back to Admin
            </Button>
          </div>
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
        onFileUploadSuccess={handleFileUploadSuccess}
      />

      {/* Create Dataset Modal */}
      <CreateDatasetModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSuccess={handleDatasetCreated}
      />
    </div>
  );
}
