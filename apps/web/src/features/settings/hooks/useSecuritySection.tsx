import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useChangePassword } from "../../../api/hooks/requests/auth";
import { useAuthStore } from "../../../store/auth";
import {
    ChangePasswordFormSchema,
    type ChangePasswordFormState,
} from "../../../types/forms";

/**
 * Hook to manage security section state and operations
 *
 * @returns Security section state and handlers
 */
export function useSecuritySection() {
    const [success, setSuccess] = useState(false);
    const { user } = useAuthStore();
    const { execute, isLoading } = useChangePassword(user?.id.toString() ?? "");

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid, isDirty },
        setError,
    } = useForm<ChangePasswordFormState>({
        resolver: zodResolver(ChangePasswordFormSchema),
        mode: "onChange",
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    /**
     * Handle password update
     */
    const onSubmit = async (data: ChangePasswordFormState) => {
        setSuccess(false);

        if (!user?.id) {
            setError("root", {
                type: "manual",
                message:
                    "User information is not available. Please log in again.",
            });
            return;
        }

        try {
            await execute({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            });
            setSuccess(true);
            reset();
        } catch (err) {
            setError("root", {
                type: "manual",
                message:
                    err instanceof Error
                        ? err.message
                        : "Failed to update password",
            });
        }
    };

    /**
     * Clear password fields
     */
    const handleClearPasswords = () => {
        reset();
        setSuccess(false);
    };

    return {
        register,
        errors,
        success,
        isLoading,
        isUpdateDisabled: !isDirty || !isValid || isLoading,
        handleUpdatePassword: handleSubmit(onSubmit),
        handleClearPasswords,
    };
}
