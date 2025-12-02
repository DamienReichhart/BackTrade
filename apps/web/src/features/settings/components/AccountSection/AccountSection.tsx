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
        email,
        isEditing,
        error,
        isLoading,
        handleEmailChange,
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
                        value={email}
                        onChange={(e) => handleEmailChange(e.target.value)}
                        disabled={!isEditing}
                        hasError={!!error}
                        error={error ?? undefined}
                    />
                </div>
                {error && <p className={styles.errorMessage}>{error}</p>}
                <div className={styles.actions}>
                    {isEditing ? (
                        <>
                            <Button
                                variant="primary"
                                size="medium"
                                onClick={handleSave}
                                disabled={isLoading}
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
