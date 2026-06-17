import type { PublicUser } from "@backtrade/types";
import { X } from "lucide-react";
import { useUserEditModal } from "../../../hooks";
import { Button } from "../../../../../components/Button";
import { Icon } from "../../../../../components/Icon";
import { Input } from "../../../../../components/Input";
import { Select } from "../../../../../components/Select";
import { Checkbox } from "../../../../../components/Checkbox";
import { ROLE_OPTIONS } from "../../utils";
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
 * Modal for editing user details (email, role, banned status)
 */
export function UserEditModal({
    user,
    isOpen,
    onClose,
    onSuccess,
}: UserEditModalProps) {
    // Use a key based on user.id and isOpen to reset form state is handled in hook effect
    // but react-hook-form reset handles this cleaner.

    const { register, control, errors, isLoading, handleSubmit, Controller } =
        useUserEditModal(user, isOpen, onClose, onSuccess);

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
                        <Icon icon={X} size="md" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.content}>
                        <Input
                            label="Email"
                            type="email"
                            error={errors.email?.message}
                            hasError={!!errors.email}
                            disabled={isLoading}
                            required
                            {...register("email")}
                        />

                        <div className={styles.field}>
                            <label htmlFor="role" className={styles.label}>
                                Role
                            </label>
                            <Controller
                                name="role"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        value={field.value ?? ""}
                                        options={ROLE_OPTIONS}
                                        placeholder="Select role"
                                        disabled={isLoading}
                                    />
                                )}
                            />
                            {errors.role && (
                                <span className={styles.error}>
                                    {errors.role.message}
                                </span>
                            )}
                        </div>

                        <div className={styles.field}>
                            <Controller
                                name="is_banned"
                                control={control}
                                render={({ field }) => (
                                    <Checkbox
                                        label="Banned"
                                        checked={field.value}
                                        onChange={(e) =>
                                            field.onChange(e.target.checked)
                                        }
                                        disabled={isLoading}
                                    />
                                )}
                            />
                        </div>

                        {errors.root && (
                            <div className={styles.submitError}>
                                {errors.root.message}
                            </div>
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
