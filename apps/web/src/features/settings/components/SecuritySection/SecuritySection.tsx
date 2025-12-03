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
        passwords,
        error,
        success,
        isLoading,
        isUpdateDisabled,
        handlePasswordChange,
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
                <div className={styles.subsection}>
                    <h3 className={styles.subtitle}>Change password</h3>
                    <div className={styles.row}>
                        <div className={styles.column}>
                            <Input
                                label="Current password"
                                type="password"
                                value={passwords.current}
                                onChange={(e) =>
                                    handlePasswordChange(
                                        "current",
                                        e.target.value
                                    )
                                }
                            />
                            <Input
                                label="Confirm new password"
                                type="password"
                                value={passwords.confirm}
                                onChange={(e) =>
                                    handlePasswordChange(
                                        "confirm",
                                        e.target.value
                                    )
                                }
                            />
                        </div>
                        <div className={styles.column}>
                            <Input
                                label="New password"
                                type="password"
                                value={passwords.new}
                                onChange={(e) =>
                                    handlePasswordChange("new", e.target.value)
                                }
                            />
                        </div>
                    </div>
                    <p className={styles.requirements}>
                        Minimum 8 characters. Include letters and numbers. Avoid
                        reused passwords.
                    </p>
                    {error && <p className={styles.errorMessage}>{error}</p>}
                    {success && (
                        <p className={styles.successMessage}>
                            Password updated successfully!
                        </p>
                    )}
                    <div className={styles.actions}>
                        <Button
                            variant="primary"
                            size="medium"
                            onClick={handleUpdatePassword}
                            disabled={isUpdateDisabled}
                        >
                            {isLoading ? "Updating..." : "Update password"}
                        </Button>
                        <Button
                            variant="outline"
                            size="medium"
                            onClick={handleClearPasswords}
                            disabled={isLoading}
                        >
                            Clear
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
