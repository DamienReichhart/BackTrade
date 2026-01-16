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
                const CHUNK_SIZE = 50 * 1024 * 1024; // 50MB
                const fileSize = fileToUpload!.size;
                const totalChunks = Math.ceil(fileSize / CHUNK_SIZE);

                let lastResult = null;

                if (totalChunks <= 1) {
                    // Single file upload
                    const formData = new FormData();
                    formData.append("file", fileToUpload as File);
                    lastResult = await execute(formData);
                } else {
                    // Chunked upload
                    for (let i = 0; i < totalChunks; i++) {
                        const start = i * CHUNK_SIZE;
                        const end = Math.min(fileSize, start + CHUNK_SIZE);
                        const chunk = fileToUpload!.slice(start, end);

                        const formData = new FormData();
                        // Append original filename to maintain identity if needed by backend,
                        // though backend might rely on filename in Content-Disposition
                        formData.append("file", chunk, fileToUpload!.name);
                        formData.append("chunkIndex", String(i));
                        formData.append("totalChunks", String(totalChunks));

                        lastResult = await execute(formData);
                    }
                }

                // Clear selected file on success
                setSelectedFile(null);
                setError(null);

                return lastResult;
            } catch {
                setError("Failed to upload file");
                return null;
            }
        },
        [selectedFile, execute]
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
