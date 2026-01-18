import { useParams, useNavigate } from "react-router-dom";
import { useCallback, useMemo } from "react";
import {
    useSessionAnalytics,
    useSession,
} from "../../../api/hooks/requests/sessions";
import { exportAnalyticsCsv } from "../utils";
import type { SessionAnalyticsResponse, Session } from "@backtrade/types";

/**
 * Analytics page hook return type
 */
interface UseAnalyticsPageReturn {
    /** Session ID from URL params */
    sessionId: string | undefined;
    /** Analytics data */
    analytics: SessionAnalyticsResponse | null | undefined;
    /** Session data */
    session: Session | null | undefined;
    /** Loading state */
    isLoading: boolean;
    /** Error state */
    error: Error | null;
    /** Navigate back to dashboard */
    handleBackClick: () => void;
    /** Export PDF handler */
    handleExportPdf: () => void;
    /** Export CSV handler */
    handleExportCsv: () => void;
}

/**
 * Hook for managing analytics page state and actions
 *
 * Handles data fetching, navigation, and export functionality
 */
export function useAnalyticsPage(): UseAnalyticsPageReturn {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const {
        data: analytics,
        isLoading: analyticsLoading,
        error: analyticsError,
    } = useSessionAnalytics(id!);

    const {
        data: session,
        isLoading: sessionLoading,
        error: sessionError,
    } = useSession(id!);

    const isLoading = analyticsLoading || sessionLoading;
    const error = analyticsError ?? sessionError;

    const handleBackClick = useCallback(() => {
        navigate("/dashboard");
    }, [navigate]);

    const handleExportPdf = useCallback(() => {
        // PDF export logic - could integrate with a PDF generation service
        window.print();
    }, []);

    const handleExportCsv = useCallback(() => {
        if (!analytics || !id) return;
        exportAnalyticsCsv(analytics, id);
    }, [analytics, id]);

    return useMemo(
        () => ({
            sessionId: id,
            analytics,
            session,
            isLoading,
            error,
            handleBackClick,
            handleExportPdf,
            handleExportCsv,
        }),
        [
            id,
            analytics,
            session,
            isLoading,
            error,
            handleBackClick,
            handleExportPdf,
            handleExportCsv,
        ]
    );
}
