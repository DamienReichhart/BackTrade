import { useState, useCallback } from "react";
import type { Dataset } from "@backtrade/types";
import { useDatasetManagement, useDatasetDelete } from "./hooks";
import {
    DatasetTable,
    CreateDatasetModal,
    StatsCards,
    SearchFilter,
    EmptyState,
    DatasetDetailsModal,
} from "./components";
import { ConfirmModal } from "../../../components/ConfirmModal";
import { Button } from "../../../components/Button";
import styles from "./DatasetManagement.module.css";

/**
 * Dataset Management page component
 *
 * Admin page for managing datasets with sorting, filtering, and CRUD operations
 */
export function DatasetManagement() {
    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(
        null
    );
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    // Dataset management hook
    const {
        // State
        sortField,
        sortOrder,
        datasets,
        allDatasets,
        isLoading,
        error,

        // Filter state
        searchQuery,
        timeframeFilter,
        statusFilter,
        hasActiveFilters,

        // Handlers
        handleSort,
        handleSearchChange,
        handleTimeframeChange,
        handleStatusChange,
        handleClearFilters,
        handleBackToAdmin,
        refetchDatasets,
    } = useDatasetManagement();

    // Delete functionality
    const {
        isConfirmOpen: isDeleteConfirmOpen,
        isDeleting,
        openDeleteConfirm,
        closeDeleteConfirm,
        handleDelete,
    } = useDatasetDelete();

    // Create modal handlers
    const handleCreateDataset = useCallback(() => {
        setIsCreateModalOpen(true);
    }, []);

    const handleCloseCreateModal = useCallback(() => {
        setIsCreateModalOpen(false);
    }, []);

    const handleDatasetCreated = useCallback(() => {
        refetchDatasets();
    }, [refetchDatasets]);

    // File upload handlers
    const handleFileUploadSuccess = useCallback(() => {
        refetchDatasets();
    }, [refetchDatasets]);

    // Details modal handlers
    const handleViewDetails = useCallback((dataset: Dataset) => {
        setSelectedDataset(dataset);
        setIsDetailsModalOpen(true);
    }, []);

    const handleCloseDetailsModal = useCallback(() => {
        setIsDetailsModalOpen(false);
        setSelectedDataset(null);
    }, []);

    const handleDeleteFromDetails = useCallback(() => {
        if (selectedDataset) {
            openDeleteConfirm(selectedDataset.id);
            setIsDetailsModalOpen(false);
        }
    }, [selectedDataset, openDeleteConfirm]);

    const handleUploadFromDetails = useCallback(() => {
        // Close the details modal and trigger file input
        if (selectedDataset) {
            setIsDetailsModalOpen(false);
            // Find the file input for this dataset and click it
            const fileInput = document.querySelector(
                `[data-dataset-id="${selectedDataset.id}"]`
            ) as HTMLInputElement;
            if (fileInput) {
                fileInput.click();
            }
        }
    }, [selectedDataset]);

    // Delete handlers
    const handleDeleteClick = useCallback(
        (datasetId: number) => {
            openDeleteConfirm(datasetId);
        },
        [openDeleteConfirm]
    );

    const handleConfirmDelete = useCallback(async () => {
        const success = await handleDelete();
        if (success) {
            refetchDatasets();
        }
    }, [handleDelete, refetchDatasets]);

    // Determine what to show in the content area
    const showEmptyState = !isLoading && !error && datasets.length === 0;
    const showTable = !showEmptyState;

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.headerTop}>
                    <div className={styles.headerLeft}>
                        <h1 className={styles.title}>Dataset Management</h1>
                        <p className={styles.subtitle}>
                            Manage datasets, view statistics, and monitor data
                            uploads
                        </p>
                    </div>
                    <div className={styles.headerActions}>
                        <Button variant="primary" onClick={handleCreateDataset}>
                            + Create Dataset
                        </Button>
                        <Button variant="outline" onClick={handleBackToAdmin}>
                            ← Back to Admin
                        </Button>
                    </div>
                </div>
            </header>

            {/* Statistics Cards */}
            <StatsCards datasets={allDatasets} isLoading={isLoading} />

            {/* Search and Filters */}
            <SearchFilter
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                timeframeFilter={timeframeFilter}
                onTimeframeChange={handleTimeframeChange}
                statusFilter={statusFilter}
                onStatusChange={handleStatusChange}
                onClearFilters={handleClearFilters}
                hasActiveFilters={hasActiveFilters}
            />

            {/* Main Content */}
            {showEmptyState && (
                <EmptyState
                    hasFilters={hasActiveFilters}
                    onClearFilters={handleClearFilters}
                    onCreateDataset={handleCreateDataset}
                />
            )}

            {showTable && (
                <>
                    {/* Results count */}
                    {hasActiveFilters && !isLoading && (
                        <p className={styles.resultsCount}>
                            Showing {datasets.length} of {allDatasets.length}{" "}
                            datasets
                        </p>
                    )}

                    {/* Dataset Table */}
                    <DatasetTable
                        datasets={datasets}
                        isLoading={isLoading}
                        error={error}
                        sortField={sortField}
                        sortOrder={sortOrder}
                        onSort={handleSort}
                        onFileUploadSuccess={handleFileUploadSuccess}
                        onViewDetails={handleViewDetails}
                        onDelete={handleDeleteClick}
                    />
                </>
            )}

            {/* Create Dataset Modal */}
            <CreateDatasetModal
                isOpen={isCreateModalOpen}
                onClose={handleCloseCreateModal}
                onSuccess={handleDatasetCreated}
            />

            {/* Dataset Details Modal */}
            <DatasetDetailsModal
                isOpen={isDetailsModalOpen}
                dataset={selectedDataset}
                onClose={handleCloseDetailsModal}
                onDelete={handleDeleteFromDetails}
                onUpload={handleUploadFromDetails}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={isDeleteConfirmOpen}
                title="Delete Dataset"
                message="Are you sure you want to delete this dataset? This action cannot be undone and will permanently remove all associated data."
                confirmLabel="Delete"
                cancelLabel="Cancel"
                confirmVariant="primary"
                isLoading={isDeleting}
                onConfirm={handleConfirmDelete}
                onCancel={closeDeleteConfirm}
            />
        </div>
    );
}
