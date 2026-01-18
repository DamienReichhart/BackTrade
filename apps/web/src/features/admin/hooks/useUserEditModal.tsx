import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type PublicUser, type UpdateUserRequest } from "@backtrade/types";
import { useUpdateUser } from "../../../api/hooks/requests/users";
import { useModalBehavior } from "../../../hooks/useModalBehavior";
import {
    UserEditFormSchema,
    type UserEditFormState,
} from "../../../types/forms";

/**
 * Hook for managing user edit modal state and logic
 */
export function useUserEditModal(
    user: PublicUser,
    isOpen: boolean,
    onClose: () => void,
    onSuccess: () => void
) {
    const updateUserMutation = useUpdateUser(user.id.toString());

    // Handle modal behavior (Escape key, body scroll)
    useModalBehavior(isOpen, onClose);

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors, isDirty },
        setError,
    } = useForm<UserEditFormState>({
        resolver: zodResolver(UserEditFormSchema),
        defaultValues: {
            email: user.email,
            role: user.role,
            is_banned: user.is_banned,
        },
    });

    // Reset form when user changes or modal opens
    useEffect(() => {
        if (isOpen) {
            reset({
                email: user.email,
                role: user.role,
                is_banned: user.is_banned,
            });
        }
    }, [user, isOpen, reset]);

    /**
     * Handle form submission
     */
    const onSubmit = async (data: UserEditFormState) => {
        try {
            const updateData: UpdateUserRequest = {};

            if (data.email !== user.email) {
                updateData.email = data.email;
            }

            if (data.role !== user.role) {
                updateData.role = data.role;
            }

            if (data.is_banned !== user.is_banned) {
                updateData.is_banned = data.is_banned;
            }

            // Only update if there are changes
            if (Object.keys(updateData).length > 0) {
                await updateUserMutation.execute(updateData);
                onSuccess();
            } else {
                onClose();
            }
        } catch (error) {
            setError("root", {
                type: "manual",
                message:
                    error instanceof Error
                        ? error.message
                        : "Failed to update user",
            });
        }
    };

    return {
        register,
        control,
        errors,
        isDirty,
        isLoading: updateUserMutation.isLoading,
        handleSubmit: handleSubmit(onSubmit),
        Controller,
    };
}
