import { useState } from "react";
import { useAuthStore } from "../../../store/auth";
import { useUpdateUser } from "../../../api/hooks/requests/users";
import { validateEmail } from "@backtrade/utils";

/**
 * Hook to manage account section state and operations
 *
 * @returns Account section state and handlers
 */
export function useAccountSection() {
    const { user } = useAuthStore();
    const [email, setEmail] = useState(user?.email ?? "");
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { execute, isLoading } = useUpdateUser(user?.id.toString() ?? "");

    /**
     * Handle email input change
     */
    const handleEmailChange = (newEmail: string) => {
        setEmail(newEmail);
        setError(null);
    };

    /**
     * Handle save email changes
     */
    const handleSave = async () => {
        if (!user) return;

        setError(null);

        // Validate email
        const validation = validateEmail(email);
        if (!validation.isValid) {
            setError(validation.error ?? "Invalid email");
            return;
        }

        try {
            await execute({ email });
            setIsEditing(false);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to update email"
            );
        }
    };

    /**
     * Handle cancel editing
     */
    const handleCancel = () => {
        setEmail(user?.email ?? "");
        setIsEditing(false);
        setError(null);
    };

    /**
     * Handle start editing
     */
    const handleEdit = () => {
        setEmail(user?.email ?? "");
        setIsEditing(true);
        setError(null);
    };

    return {
        email,
        isEditing,
        error,
        isLoading,
        handleEmailChange,
        handleSave,
        handleCancel,
        handleEdit,
    };
}
