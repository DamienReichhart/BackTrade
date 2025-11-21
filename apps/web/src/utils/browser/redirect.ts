import { API_BASE_URL } from "../../api";

export const redirectTo = (path: string) => {
    window.location.href = path;
};

export const getSessionAnalyticsUrl = (sessionId: string) => {
    return `${API_BASE_URL}/sessions/${sessionId}/analyticsFile`;
};

export const redirectToSessionAnalytics = (sessionId: string) => {
    redirectTo(getSessionAnalyticsUrl(sessionId));
};