import { Button, Input } from "../../../../components";
import { useSecuritySection } from "../../hooks";
import styles from "./SecuritySection.module.css";

/**
 * Security section component
 *
 * Handles password changes
 */
export function SecuritySection() {
    const {
        register,
        errors,
        success,
        isLoading,
        isUpdateDisabled,
        handleUpdatePassword,
        handleClearPasswords,
    } = useSecuritySection();

    return (
        <section className={styles.section}>
            <div className={styles.header}>
                <h2 className={styles.title}>Security</h2>
                <a href="#" className={styles.link}>
                    Account protection
                </a>
            </div>

            <div className={styles.content}>
                {/* Change Password Subsection */}
                <form
                    onSubmit={handleUpdatePassword}
                    className={styles.subsection}
                >
                    <h3 className={styles.subtitle}>Change password</h3>
                    <div className={styles.row}>
                        <div className={styles.column}>
                            <Input
                                label="Current password"
                                type="password"
                                autoComplete="current-password"
                                error={errors.currentPassword?.message}
                                hasError={!!errors.currentPassword}
                                {...register("currentPassword")}
                            />
                            <Input
                                label="Confirm new password"
                                type="password"
                                autoComplete="new-password"
                                error={errors.confirmPassword?.message}
                                hasError={!!errors.confirmPassword}
                                {...register("confirmPassword")}
                            />
                        </div>
                        <div className={styles.column}>
                            <Input
                                label="New password"
                                type="password"
                                autoComplete="new-password"
                                error={errors.newPassword?.message}
                                hasError={!!errors.newPassword}
                                {...register("newPassword")}
                            />
                        </div>
                    </div>
                    <p className={styles.requirements}>
                        Minimum 8 characters. Include letters and numbers. Avoid
                        reused passwords.
                    </p>
                    {errors.root && (
                        <p className={styles.errorMessage}>
                            {errors.root.message}
                        </p>
                    )}
                    {success && (
                        <p className={styles.successMessage}>
                            Password updated successfully!
                        </p>
                    )}
                    <div className={styles.actions}>
                        <Button
                            variant="primary"
                            size="medium"
                            type="submit"
                            disabled={isUpdateDisabled}
                        >
                            {isLoading ? "Updating..." : "Update password"}
                        </Button>
                        <Button
                            variant="outline"
                            size="medium"
                            type="button"
                            onClick={handleClearPasswords}
                            disabled={isLoading}
                        >
                            Clear
                        </Button>
                    </div>
                </form>
            </div>
        </section>
    );
}
