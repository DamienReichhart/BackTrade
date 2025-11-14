import { useState } from "react";
import styles from "./ArchiveButton.module.css";
import { useArchive } from "./hooks";
import { ConfirmModal } from "../../../../../../../../../components";

interface ArchiveButtonProps {
  /**
   * Callback when archive fails
   */
  onError?: (error: string) => void;
  /**
   * Callback when archive succeeds
   */
  onSuccess?: () => void;
}

/**
 * ArchiveButton component
 *
 * Archives the current session with a confirmation warning
 */
export function ArchiveButton({ onError, onSuccess }: ArchiveButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isArchiving, isDisabled, handleArchive } = useArchive(
    onError,
    onSuccess,
  );

  const handleClick = () => {
    setIsModalOpen(true);
  };

  const handleConfirm = async () => {
    await handleArchive();
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        className={styles.button}
        onClick={handleClick}
        disabled={isDisabled}
      >
        Archive Session
      </button>
      <ConfirmModal
        isOpen={isModalOpen}
        title="Archive Session"
        message="Are you sure you want to archive this session? This action is not reversible and will set the session status to archived."
        confirmLabel="Archive"
        cancelLabel="Cancel"
        confirmVariant="primary"
        cancelVariant="outline"
        isLoading={isArchiving}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
}
