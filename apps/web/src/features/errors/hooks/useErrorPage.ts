import { useNavigate } from "react-router-dom";
import type { ErrorPageConfig } from "../components/ErrorPage/ErrorPage";

/**
 * Hook for managing error page actions and navigation
 */
export function useErrorPage(config: ErrorPageConfig) {
  const navigate = useNavigate();

  /**
   * Handle primary action - navigate to home or execute custom action
   */
  const handlePrimaryAction = () => {
    if (config.primaryAction) {
      config.primaryAction();
    } else {
      navigate("/");
    }
  };

  /**
   * Handle go back action
   */
  const handleGoBack = () => {
    window.history.back();
  };

  /**
   * Handle refresh action (for service unavailable errors)
   */
  const handleRefresh = () => {
    window.location.reload();
  };

  return {
    handlePrimaryAction,
    handleGoBack,
    handleRefresh,
  };
}
