import { useState } from "react";
import { Button, Input, Toggle } from "../../../../components";
import { useChangePassword } from "../../../../api/hooks/requests/auth";
import styles from "./SecuritySection.module.css";

/**
 * Security section component
 *
 * Handles password changes and two-factor authentication settings
 */
export function SecuritySection() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { execute, isLoading } = useChangePassword();

  const handlePasswordChange = (field: string, value: string) => {
    setPasswords((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(false);
  };

  const handleUpdatePassword = async () => {
    setError(null);
    setSuccess(false);

    if (passwords.new !== passwords.confirm) {
      setError("Passwords don't match");
      return;
    }

    if (passwords.new.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    try {
      await execute({
        currentPassword: passwords.current,
        newPassword: passwords.new,
        confirmPassword: passwords.confirm,
      });
      setSuccess(true);
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update password",
      );
    }
  };

  const handleClearPasswords = () => {
    setPasswords({ current: "", new: "", confirm: "" });
    setError(null);
    setSuccess(false);
  };

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
                  handlePasswordChange("current", e.target.value)
                }
              />
              <Input
                label="Confirm new password"
                type="password"
                value={passwords.confirm}
                onChange={(e) =>
                  handlePasswordChange("confirm", e.target.value)
                }
              />
            </div>
            <div className={styles.column}>
              <Input
                label="New password"
                type="password"
                value={passwords.new}
                onChange={(e) => handlePasswordChange("new", e.target.value)}
              />
            </div>
          </div>
          <p className={styles.requirements}>
            Minimum 8 characters. Include letters and numbers. Avoid reused
            passwords.
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
              disabled={
                isLoading ||
                !passwords.current ||
                !passwords.new ||
                !passwords.confirm
              }
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

        {/* Two-Factor Authentication Subsection */}
        <div className={styles.subsection}>
          <h3 className={styles.subtitle}>Two-factor authentication</h3>
          <Toggle
            label="Enable 2FA with an authenticator app"
            checked={twoFactorEnabled}
            onChange={setTwoFactorEnabled}
          />
        </div>
      </div>
    </section>
  );
}
