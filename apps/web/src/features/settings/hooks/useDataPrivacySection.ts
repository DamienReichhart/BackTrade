import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../context/AuthContext";
import { useDeleteUser } from "../../../api/hooks/requests/users";

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

  /**
   * Handle account deletion
   */
  const handleDeleteAccount = async () => {
    if (!user) return;

    setError(null);

    try {
      await execute();
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
