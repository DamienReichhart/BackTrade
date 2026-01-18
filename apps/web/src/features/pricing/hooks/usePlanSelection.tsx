import { useNavigate } from "react-router-dom";

/**
 * Hook to handle plan selection logic
 *
 * @param isLoggedIn - Whether the user is logged in
 * @returns Plan selection handler
 */
export function usePlanSelection(isLoggedIn: boolean) {
    const navigate = useNavigate();

    /**
     * Handle plan selection
     *
     * @param _code - Plan code
     * @param _planId - plan ID
     */
    const handleSelectPlan = (_code: string, _planId?: number) => {
        if (isLoggedIn) {
            navigate("/dashboard/plans");
        } else {
            navigate("/signup");
        }
    };

    return {
        handleSelectPlan,
    };
}
