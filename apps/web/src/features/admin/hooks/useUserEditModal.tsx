import { useState } from "react";
import {
  RoleSchema,
  type PublicUser,
  type UpdateUserRequest,
} from "@backtrade/types";
import { useUpdateUser } from "../../../api/hooks/requests/users";
import { useModalBehavior } from "../../../hooks/useModalBehavior";
import { validateEmail, validateRole } from "@backtrade/utils";

/**
 * Hook for managing user edit modal state and logic
 */
export function useUserEditModal(
  user: PublicUser,
  isOpen: boolean,
  onClose: () => void,
  onSuccess: () => void,
) {
  const [email, setEmail] = useState<string>(user.email);
  const [role, setRole] = useState<string>(user.role);
  const [isBanned, setIsBanned] = useState<boolean>(user.is_banned);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateUserMutation = useUpdateUser(user.id.toString());

  // Handle modal behavior (Escape key, body scroll)
  useModalBehavior(isOpen, onClose);

  /**
   * Validate form
   */
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.error ?? "Invalid email";
    }

    const roleValidation = validateRole(role);
    if (!roleValidation.isValid) {
      newErrors.role = roleValidation.error ?? "Invalid role";
    } else {
      // Validate role against schema
      if (!RoleSchema.safeParse(role).success) {
        newErrors.role = "Invalid role";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      const updateData: UpdateUserRequest = {};

      if (email !== user.email) {
        updateData.email = email;
      }

      if (role !== user.role) {
        updateData.role = RoleSchema.parse(role);
      }

      if (isBanned !== user.is_banned) {
        updateData.is_banned = isBanned;
      }

      // Only update if there are changes
      if (Object.keys(updateData).length > 0) {
        await updateUserMutation.execute(updateData);
        onSuccess();
      } else {
        onClose();
      }
    } catch (error) {
      setErrors({
        submit:
          error instanceof Error ? error.message : "Failed to update user",
      });
    }
  };

  return {
    // Form state
    email,
    setEmail,
    role,
    setRole,
    isBanned,
    setIsBanned,
    errors,

    // Mutation state
    isLoading: updateUserMutation.isLoading,

    // Handlers
    handleSubmit,
  };
}
