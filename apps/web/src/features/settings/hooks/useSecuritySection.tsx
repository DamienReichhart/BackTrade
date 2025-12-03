import { useState } from "react";
import { useChangePassword } from "../../../api/hooks/requests/auth";
import {
    validatePassword,
    validatePasswordConfirmation,
} from "@backtrade/utils";
import { useAuthStore } from "../../../store/auth";

/**
 * Password form state
 */
export interface PasswordFormState {
    current: string;
    new: string;
    confirm: string;
}

/**
 * Hook to manage security section state and operations
 *
 * @returns Security section state and handlers
 */
export function useSecuritySection() {
    const [passwords, setPasswords] = useState<PasswordFormState>({
        current: "",
        new: "",
        confirm: "",
    });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const { user } = useAuthStore();

    const { execute, isLoading } = useChangePassword(user?.id.toString() ?? "");

    /**
     * Handle password field change
     */
    const handlePasswordChange = (
        field: keyof PasswordFormState,
        value: string
    ) => {
        setPasswords((prev) => ({ ...prev, [field]: value }));
        setError(null);
        setSuccess(false);
    };

    /**
     * Handle password update
     */
    const handleUpdatePassword = async () => {
        setError(null);
        setSuccess(false);

        if (!user?.id) {
            setError("User information is not available. Please log in again.");
            return;
        }

        // Validate current password
        if (!passwords.current) {
            setError("Current password is required");
            return;
        }

        // Validate new password
        const passwordValidation = validatePassword(passwords.new);
        if (!passwordValidation.isValid) {
            setError(passwordValidation.error ?? "Invalid password");
            return;
        }

        // Validate password confirmation
        const confirmationValidation = validatePasswordConfirmation(
            passwords.new,
            passwords.confirm
        );
        if (!confirmationValidation.isValid) {
            setError(confirmationValidation.error ?? "Passwords don't match");
            return;
        }

        try {
            await execute({
                currentPassword: passwords.current,
                newPassword: passwords.new,
            });
            setSuccess(true);
            setPasswords({ current: "", new: "", confirm: "" });
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to update password"
            );
        }
    };

    /**
     * Clear password fields
     */
    const handleClearPasswords = () => {
        setPasswords({ current: "", new: "", confirm: "" });
        setError(null);
        setSuccess(false);
    };

    /**
     * Check if update password button should be disabled
     */
    const isUpdateDisabled =
        isLoading || !passwords.current || !passwords.new || !passwords.confirm;

    return {
        passwords,
        error,
        success,
        isLoading,
        isUpdateDisabled,
        handlePasswordChange,
        handleUpdatePassword,
        handleClearPasswords,
    };
}
