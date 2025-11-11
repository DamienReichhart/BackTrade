import { useMemo } from "react";
import type { PublicUser } from "@backtrade/types";
import { useUserEditModal } from "../../../hooks";
import { Button } from "../../../../../components/Button";
import { Input } from "../../../../../components/Input";
import { Select } from "../../../../../components/Select";
import styles from "./UserEditModal.module.css";

/**
 * User Edit Modal component props
 */
interface UserEditModalProps {
  /**
   * User to edit
   */
  user: PublicUser;

  /**
   * Whether the modal is open
   */
  isOpen: boolean;

  /**
   * Callback when modal is closed
   */
  onClose: () => void;

  /**
   * Callback when update is successful
   */
  onSuccess: () => void;
}

/**
 * User Edit Modal component
 *
 * Modal for editing user details (email, role)
 */
export function UserEditModal({
  user,
  isOpen,
  onClose,
  onSuccess,
}: UserEditModalProps) {
  // Use a key based on user.id and isOpen to reset form state
  const formKey = useMemo(() => `${user.id}-${isOpen}`, [user.id, isOpen]);

  const {
    // Form state
    email,
    setEmail,
    role,
    setRole,
    errors,

    // Mutation state
    isLoading,

    // Handlers
    handleSubmit,
  } = useUserEditModal(user, isOpen, onClose, onSuccess);

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-user-title"
      >
        <div className={styles.header}>
          <h2 id="edit-user-title" className={styles.title}>
            Edit User
          </h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close modal"
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        <form key={formKey} onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.content}>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              hasError={!!errors.email}
              disabled={isLoading}
              required
            />

            <div className={styles.field}>
              <label htmlFor="role" className={styles.label}>
                Role
              </label>
              <Select
                value={role}
                onChange={setRole}
                options={[
                  { value: "ANONYMOUS", label: "Anonymous" },
                  { value: "USER", label: "User" },
                  { value: "ADMIN", label: "Admin" },
                ]}
                placeholder="Select role"
                disabled={isLoading}
              />
              {errors.role && (
                <span className={styles.error}>{errors.role}</span>
              )}
            </div>

            {errors.submit && (
              <div className={styles.submitError}>{errors.submit}</div>
            )}
          </div>

          <div className={styles.footer}>
            <Button
              variant="outline"
              size="medium"
              onClick={onClose}
              disabled={isLoading}
              type="button"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="medium"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update User"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
