import { useNavigate } from "react-router-dom";

export type AdminSection = "user-management" | "data-management";

/**
 * Hook for managing admin choices navigation
 */
export function useAdminChoices() {
  const navigate = useNavigate();

  /**
   * Handle menu item click and navigate to the selected section
   */
  const handleMenuClick = (section: AdminSection) => {
    navigate(`/dashboard/admin/${section}`);
  };

  return {
    handleMenuClick,
  };
}
