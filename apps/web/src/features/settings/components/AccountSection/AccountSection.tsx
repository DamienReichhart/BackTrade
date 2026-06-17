import { Input, Button } from "../../../../components";
import { useAccountSection } from "../../hooks";
import styles from "./AccountSection.module.css";

interface AccountSectionProps {
    accountId: string;
}

/**
 * Account section component
 *
 * Displays and allows editing of user account information
 */
export function AccountSection({ accountId }: AccountSectionProps) {
    const {
        register,
        errors,
        isEditing,
        isLoading,
        isValid,
        handleSave,
        handleCancel,
        handleEdit,
    } = useAccountSection();

    return (
        <section className={styles.section}>
            <div className={styles.header}>
                <h2 className={styles.title}>Account</h2>
                <span className={styles.accountId}>ID #{accountId}</span>
            </div>

            <div className={styles.content}>
                <div className={styles.emailField}>
                    <Input
                        label="Email"
                        type="email"
                        autoComplete="email"
                        disabled={!isEditing}
                        hasError={!!errors.email}
                        error={errors.email?.message}
                        {...register("email")}
                    />
                </div>
                {/* General errors can be displayed here if needed */}
                {errors.root && (
                    <p className={styles.errorMessage}>{errors.root.message}</p>
                )}

                <div className={styles.actions}>
                    {isEditing ? (
                        <>
                            <Button
                                variant="primary"
                                size="medium"
                                onClick={handleSave}
                                disabled={isLoading || !isValid}
                            >
                                {isLoading ? "Saving..." : "Save"}
                            </Button>
                            <Button
                                variant="outline"
                                size="medium"
                                onClick={handleCancel}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                        </>
                    ) : (
                        <Button
                            variant="outline"
                            size="medium"
                            onClick={handleEdit}
                        >
                            Edit
                        </Button>
                    )}
                </div>
            </div>
        </section>
    );
}
