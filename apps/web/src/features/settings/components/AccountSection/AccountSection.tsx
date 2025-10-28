import { useState } from "react";
import { Input, Button } from "../../../../components";
import { useAuthStore } from "../../../../context/AuthContext";
import { useUpdateUser } from "../../../../api/requests/users";
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
  const { user } = useAuthStore();
  const [email, setEmail] = useState(user?.email ?? "");
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { execute, isLoading } = useUpdateUser(user?.id.toString() ?? "");

  const handleSave = async () => {
    if (!user) return;

    setError(null);

    try {
      await execute({ email });
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update email");
    }
  };

  const handleCancel = () => {
    setEmail(user?.email ?? "");
    setIsEditing(false);
    setError(null);
  };

  const handleEdit = () => {
    setEmail(user?.email ?? "");
    setIsEditing(true);
  };

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
            onChange={(e) => setEmail(e.target.value)}
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
            <Button variant="outline" size="medium" onClick={handleEdit}>
              Edit
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
