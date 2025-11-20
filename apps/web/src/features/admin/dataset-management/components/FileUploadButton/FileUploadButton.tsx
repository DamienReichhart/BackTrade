import { useRef, useState } from "react";
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
}

/**
 * File Upload Button component
 *
 * Allows users to upload a file for a specific dataset
 */
export function FileUploadButton({
  datasetId,
  onSuccess,
  hasFile = false,
}: FileUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { error, isLoading, handleFileSelect, handleUpload, resetUpload } =
    useDatasetFileUpload(datasetId);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;

    // Auto-upload after file selection
    if (file) {
      uploadFile(file);
    } else {
      handleFileSelect(null);
    }
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    // Set the file in state for consistency
    handleFileSelect(file);

    try {
      // Pass the file directly to avoid race condition with state update
      const result = await handleUpload(file);
      if (result) {
        onSuccess?.();
        resetUpload();
      }
    } finally {
      setIsUploading(false);
      // Reset input value to allow re-uploading same file
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className={styles.container}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className={styles.hiddenInput}
        disabled={isLoading || isUploading}
      />

      <Button
        variant={hasFile ? "outline" : "primary"}
        size="small"
        onClick={handleButtonClick}
        disabled={isLoading || isUploading}
      >
        {isLoading || isUploading
          ? "Uploading..."
          : hasFile
            ? "Re-upload"
            : "Upload File"}
      </Button>

      {error && <span className={styles.error}>{String(error)}</span>}
    </div>
  );
}
