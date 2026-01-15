export const redirectTo = (path: string) => {
    window.location.href = path;
};

export const getSessionAnalyticsUrl = (sessionId: string) => {
    return `/dashboard/sessions/${sessionId}/analytics`;
};

export const redirectToSessionAnalytics = (sessionId: string) => {
    redirectTo(getSessionAnalyticsUrl(sessionId));
};
