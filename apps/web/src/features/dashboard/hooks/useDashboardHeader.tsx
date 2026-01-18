import { useNavigate } from "react-router-dom";

/**
 * Hook to manage dashboard header actions
 *
 * @returns Dashboard header handlers
 */
export function useDashboardHeader() {
    const navigate = useNavigate();
    const handleNewSession = () => {
        navigate("/dashboard/sessions/add");
    };

    return {
        handleNewSession,
    };
}
