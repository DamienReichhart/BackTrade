import { useState, useCallback } from "react";
import { useUploadDataset } from "../../../../api/hooks/requests/datasets";
import { validateFile } from "@backtrade/utils";

/**
 * Hook for managing dataset file upload
 *
 * This hook handles:
 * - File selection
 * - File validation
 * - File upload API call
 *
 * @param datasetId - ID of the dataset to upload file for
 * @returns Object containing upload state and handlers
 */
export function useDatasetFileUpload(datasetId: number) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    error: apiError,
    isLoading,
    execute,
  } = useUploadDataset(String(datasetId));

  /**
   * Handle file selection
   */
  const handleFileSelect = useCallback((file: File | null) => {
    setSelectedFile(file);
    setError(null);
  }, []);

  /**
   * Handle file upload
   * @param file - Optional file to upload. If not provided, uses selectedFile from state
   */
  const handleUpload = useCallback(
    async (file?: File | null) => {
      const fileToUpload = file ?? selectedFile;

      // Validate file
      const validation = validateFile(fileToUpload);
      if (!validation.isValid) {
        setError(validation.error ?? "Invalid file");
        return null;
      }

      try {
        const formData = new FormData();
        formData.append("file", fileToUpload as File);

        const result = await execute(formData);

        // Clear selected file on success
        setSelectedFile(null);
        setError(null);

        return result;
      } catch {
        setError("Failed to upload file");
        return null;
      }
    },
    [selectedFile, execute],
  );

  /**
   * Reset upload state
   */
  const resetUpload = useCallback(() => {
    setSelectedFile(null);
    setError(null);
  }, []);

  return {
    // State
    selectedFile,
    error: error ?? apiError,
    isLoading,
    // Handlers
    handleFileSelect,
    handleUpload,
    resetUpload,
  };
}
