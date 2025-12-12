import { useState, useCallback } from "react";
import { useDeleteDataset } from "../../../../api/hooks/requests/datasets";

/**
 * Hook for managing dataset deletion
 *
 * This hook handles:
 * - Delete confirmation state
 * - Dataset deletion API call
 * - Error handling
 *
 * @returns Object containing delete state and handlers
 */
export function useDatasetDelete() {
    const [datasetToDelete, setDatasetToDelete] = useState<number | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Create a stable delete hook with the current dataset ID
    const { isLoading, execute } = useDeleteDataset(
        datasetToDelete ? String(datasetToDelete) : ""
    );

    /**
     * Open delete confirmation modal
     */
    const openDeleteConfirm = useCallback((datasetId: number) => {
        setDatasetToDelete(datasetId);
        setIsConfirmOpen(true);
        setError(null);
    }, []);

    /**
     * Close delete confirmation modal
     */
    const closeDeleteConfirm = useCallback(() => {
        setIsConfirmOpen(false);
        setDatasetToDelete(null);
        setError(null);
    }, []);

    /**
     * Execute dataset deletion
     */
    const handleDelete = useCallback(async () => {
        if (!datasetToDelete) return false;

        try {
            await execute();
            closeDeleteConfirm();
            return true;
        } catch {
            setError("Failed to delete dataset. Please try again.");
            return false;
        }
    }, [datasetToDelete, execute, closeDeleteConfirm]);

    return {
        // State
        datasetToDelete,
        isConfirmOpen,
        isDeleting: isLoading,
        error,

        // Handlers
        openDeleteConfirm,
        closeDeleteConfirm,
        handleDelete,
    };
}
