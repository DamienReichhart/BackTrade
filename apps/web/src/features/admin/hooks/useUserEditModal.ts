import { useState, useEffect, useRef, startTransition } from "react";
import {
  RoleSchema,
  type PublicUser,
  type UpdateUserRequest,
} from "@backtrade/types";
import { useUpdateUser } from "../../../api/hooks/requests/users";
import { validateEmail, validateRole } from "../utils/validation";

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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateUserMutation = useUpdateUser(user.id.toString());

  // Reset form state when user changes or modal opens
  const previousUserIdRef = useRef<number>(user.id);
  const previousIsOpenRef = useRef<boolean>(isOpen);

  useEffect(() => {
    const userChanged = previousUserIdRef.current !== user.id;
    const modalJustOpened = !previousIsOpenRef.current && isOpen;

    if (isOpen && (userChanged || modalJustOpened)) {
      previousUserIdRef.current = user.id;
      previousIsOpenRef.current = isOpen;

      // Use startTransition to defer state updates and avoid setState
      startTransition(() => {
        setEmail(user.email);
        setRole(user.role);
        setErrors({});
      });
    } else {
      previousIsOpenRef.current = isOpen;
    }
  }, [user.id, user.email, user.role, isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

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
    errors,

    // Mutation state
    isLoading: updateUserMutation.isLoading,

    // Handlers
    handleSubmit,
  };
}
