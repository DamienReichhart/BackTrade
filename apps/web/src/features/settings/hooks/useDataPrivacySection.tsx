import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/auth";
import { useDeleteUser } from "../../../api/hooks/requests/users";
import { useLogout } from "../../../api/hooks/requests/auth";

/**
 * Hook to manage data privacy section state and operations
 *
 * @returns Data privacy section state and handlers
 */
export function useDataPrivacySection() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { execute, isLoading } = useDeleteUser(user?.id.toString() ?? "");
  const { execute: logoutApi } = useLogout();

  /**
   * Handle account deletion
   */
  const handleDeleteAccount = async () => {
    if (!user) return;

    setError(null);

    try {
      await execute();
      // Call logout API endpoint before clearing local state
      try {
        await logoutApi();
      } catch {
        // Do nothing
      }
      // Logout and redirect to home after successful deletion
      logout();
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account");
      setShowConfirmDialog(false);
    }
  };

  /**
   * Show confirmation dialog
   */
  const handleConfirmDelete = () => {
    setShowConfirmDialog(true);
    setError(null);
  };

  /**
   * Cancel deletion
   */
  const handleCancelDelete = () => {
    setShowConfirmDialog(false);
    setError(null);
  };

  return {
    showConfirmDialog,
    error,
    isLoading,
    handleDeleteAccount,
    handleConfirmDelete,
    handleCancelDelete,
  };
}
