import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "../../../store/auth";
import { useUpdateUser } from "../../../api/hooks/requests/users";
import { useToast } from "../../../hooks";
import { AccountFormSchema, type AccountFormState } from "../../../types/forms";

/**
 * Hook to manage account section state and operations
 *
 * @returns Account section state and handlers
 */
export function useAccountSection() {
    const { user } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);
    const toast = useToast();
    const { execute, isLoading } = useUpdateUser(user?.id.toString() ?? "");

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid },
        setError,
    } = useForm<AccountFormState>({
        resolver: zodResolver(AccountFormSchema),
        defaultValues: {
            email: user?.email ?? "",
        },
    });

    // Update form default values when user loads
    useEffect(() => {
        if (user?.email) {
            reset({ email: user.email });
        }
    }, [user, reset]);

    /**
     * Handle save email changes
     */
    const onSubmit = async (data: AccountFormState) => {
        if (!user) return;

        try {
            await execute({ email: data.email });
            setIsEditing(false);
            toast.success("Email updated successfully");
            // Optionally, we could reset here with new values if the store doesn't update immediately,
            // but useAuthStore likely updates via query invalidation or similar mechanism.
            // reset({ email: data.email });
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Failed to update email";
            setError("email", { type: "manual", message });
            toast.error(message);
        }
    };

    /**
     * Handle cancel editing
     */
    const handleCancel = () => {
        reset({ email: user?.email ?? "" });
        setIsEditing(false);
    };

    /**
     * Handle start editing
     */
    const handleEdit = () => {
        setIsEditing(true);
    };

    return {
        register,
        errors,
        isEditing,
        isLoading,
        isValid,
        handleSave: handleSubmit(onSubmit),
        handleCancel,
        handleEdit,
    };
}
