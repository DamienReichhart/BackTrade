import { useRef, useState, useCallback } from "react";
import { Button } from "../../../../../components/Button";
import { useDatasetFileUpload } from "../../hooks";
import styles from "./FileUploadButton.module.css";

/**
 * File Upload Button component props
 */
interface FileUploadButtonProps {
    /**
     * Dataset ID to upload file for
     */
    datasetId: number;

    /**
     * Callback when file is successfully uploaded
     */
    onSuccess?: () => void;

    /**
     * Whether the dataset already has a file
     */
    hasFile?: boolean;

    /**
     * Display variant - inline for table, full for standalone
     * @default "inline"
     */
    variant?: "inline" | "full";
}

/**
 * File Upload Button component
 *
 * Allows users to upload a file for a specific dataset with progress indication
 */
export function FileUploadButton({
    datasetId,
    onSuccess,
    hasFile = false,
    variant = "inline",
}: FileUploadButtonProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedFileName, setSelectedFileName] = useState<string | null>(
        null
    );

    const { error, isLoading, handleFileSelect, handleUpload, resetUpload } =
        useDatasetFileUpload(datasetId);

    const handleButtonClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0] ?? null;

            if (file) {
                setSelectedFileName(file.name);
                uploadFile(file);
            } else {
                handleFileSelect(null);
                setSelectedFileName(null);
            }
        },
        [handleFileSelect]
    );

    const uploadFile = async (file: File) => {
        setIsUploading(true);
        setUploadProgress(0);
        handleFileSelect(file);

        // Simulate progress (since FormData upload doesn't have native progress)
        const progressInterval = setInterval(() => {
            setUploadProgress((prev) => {
                if (prev >= 90) {
                    clearInterval(progressInterval);
                    return 90;
                }
                return prev + Math.random() * 15;
            });
        }, 200);

        try {
            const result = await handleUpload(file);
            clearInterval(progressInterval);
            setUploadProgress(100);

            if (result) {
                // Brief delay to show 100% completion
                setTimeout(() => {
                    onSuccess?.();
                    resetUpload();
                    setUploadProgress(0);
                    setSelectedFileName(null);
                }, 300);
            }
        } finally {
            clearInterval(progressInterval);
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const isProcessing = isLoading || isUploading;
    const showProgress = isProcessing && uploadProgress > 0;

    if (variant === "full") {
        return (
            <div className={styles.containerFull}>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className={styles.hiddenInput}
                    disabled={isProcessing}
                />

                <div
                    className={`${styles.dropZone} ${isProcessing ? styles.dropZoneDisabled : ""}`}
                    onClick={!isProcessing ? handleButtonClick : undefined}
                >
                    {showProgress ? (
                        <div className={styles.progressContainer}>
                            <div className={styles.progressCircle}>
                                <svg
                                    className={styles.progressSvg}
                                    viewBox="0 0 36 36"
                                >
                                    <path
                                        className={styles.progressBg}
                                        d="M18 2.0845
                                            a 15.9155 15.9155 0 0 1 0 31.831
                                            a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                    <path
                                        className={styles.progressBar}
                                        strokeDasharray={`${uploadProgress}, 100`}
                                        d="M18 2.0845
                                            a 15.9155 15.9155 0 0 1 0 31.831
                                            a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                </svg>
                                <span className={styles.progressText}>
                                    {Math.round(uploadProgress)}%
                                </span>
                            </div>
                            <span className={styles.uploadingText}>
                                Uploading {selectedFileName}...
                            </span>
                        </div>
                    ) : (
                        <>
                            <span className={styles.dropZoneIcon}>📁</span>
                            <span className={styles.dropZoneText}>
                                {hasFile
                                    ? "Click to re-upload CSV file"
                                    : "Click to upload CSV file"}
                            </span>
                            <span className={styles.dropZoneHint}>
                                Supports .csv files with OHLCV data
                            </span>
                        </>
                    )}
                </div>

                {error && <span className={styles.error}>{String(error)}</span>}
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className={styles.hiddenInput}
                disabled={isProcessing}
            />

            <div className={styles.buttonWrapper}>
                <Button
                    variant={hasFile ? "outline" : "primary"}
                    size="small"
                    onClick={handleButtonClick}
                    disabled={isProcessing}
                    className={showProgress ? styles.buttonWithProgress : ""}
                >
                    {showProgress ? (
                        <span className={styles.buttonContent}>
                            <span className={styles.spinner} />
                            {Math.round(uploadProgress)}%
                        </span>
                    ) : isProcessing ? (
                        <span className={styles.buttonContent}>
                            <span className={styles.spinner} />
                            Uploading
                        </span>
                    ) : hasFile ? (
                        "Re-upload"
                    ) : (
                        "Upload"
                    )}
                </Button>
            </div>

            {error && <span className={styles.error}>{String(error)}</span>}
        </div>
    );
}
