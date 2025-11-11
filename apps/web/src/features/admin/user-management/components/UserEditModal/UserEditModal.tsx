import { useState, useEffect, useRef, useMemo, startTransition } from "react";
import {
  RoleSchema,
  type PublicUser,
  type UpdateUserRequest,
} from "@backtrade/types";
import { useUpdateUser } from "../../../../../api/hooks/requests/users";
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
 * Modal for editing user details (email, role, ban status)
 */
export function UserEditModal({
  user,
  isOpen,
  onClose,
  onSuccess,
}: UserEditModalProps) {
  // Use a key based on user.id and isOpen to reset form state
  const formKey = useMemo(() => `${user.id}-${isOpen}`, [user.id, isOpen]);

  // Initialize state from user prop
  const [email, setEmail] = useState<string>(user.email);
  const [role, setRole] = useState<string>(user.role);
  const [isBanned, setIsBanned] = useState<boolean>(user.is_banned);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateUserMutation = useUpdateUser(user.id.toString());

  // Reset form state when user changes or modal opens
  const previousUserIdRef = useRef<number>(user.id);
  const previousIsOpenRef = useRef<boolean>(isOpen);

  useEffect(() => {
    const userChanged = previousUserIdRef.current !== user.id;
    const modalJustOpened = !previousIsOpenRef.current && isOpen;

    if (isOpen && (userChanged || modalJustOpened)) {
      previousUserIdRef.current = user.id;
      previousIsOpenRef.current = isOpen;

      // Use startTransition to defer state updates and avoid setState
      startTransition(() => {
        setEmail(user.email);
        setRole(user.role);
        setIsBanned(user.is_banned);
        setErrors({});
      });
    } else {
      previousIsOpenRef.current = isOpen;
    }
  }, [user.id, user.email, user.role, user.is_banned, isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  /**
   * Validate form
   */
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (!role || !RoleSchema.safeParse(role).success) {
      newErrors.role = "Invalid role";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      const updateData: UpdateUserRequest = {};

      if (email !== user.email) {
        updateData.email = email;
      }

      if (role !== user.role) {
        updateData.role = RoleSchema.parse(role);
      }

      if (isBanned !== user.is_banned) {
        updateData.is_banned = isBanned;
      }

      // Only update if there are changes
      if (Object.keys(updateData).length > 0) {
        await updateUserMutation.execute(updateData);
        onSuccess();
      } else {
        onClose();
      }
    } catch (error) {
      setErrors({
        submit:
          error instanceof Error ? error.message : "Failed to update user",
      });
    }
  };

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
            disabled={updateUserMutation.isLoading}
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
              disabled={updateUserMutation.isLoading}
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
                disabled={updateUserMutation.isLoading}
              />
              {errors.role && (
                <span className={styles.error}>{errors.role}</span>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={isBanned}
                  onChange={(e) => setIsBanned(e.target.checked)}
                  className={styles.checkbox}
                  disabled={updateUserMutation.isLoading}
                />
                <span>Banned</span>
              </label>
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
              disabled={updateUserMutation.isLoading}
              type="button"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="medium"
              type="submit"
              disabled={updateUserMutation.isLoading}
            >
              {updateUserMutation.isLoading ? "Updating..." : "Update User"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
