import { lazy } from "react";
import { withLayout } from "./utils";

const SessionRunning = lazy(() =>
    import("../features/session").then((m) => ({ default: m.SessionRunning }))
);
const PositionsList = lazy(() =>
    import("../features/session/positions-list").then((m) => ({
        default: m.PositionsList,
    }))
);
const TransactionsList = lazy(() =>
    import("../features/session/transactions-list").then((m) => ({
        default: m.TransactionsList,
    }))
);
const SessionAdd = lazy(() =>
    import("../features/session-add").then((m) => ({ default: m.SessionAdd }))
);
const AnalyticsPage = lazy(() =>
    import("../features/analytics").then((m) => ({ default: m.AnalyticsPage }))
);

export const sessionsRoutes = [
    {
        path: "/dashboard/sessions/add",
        element: withLayout(SessionAdd),
    },
    {
        path: "/dashboard/sessions/:id",
        element: withLayout(SessionRunning),
    },
    {
        path: "/dashboard/sessions/:id/positions/list",
        element: withLayout(PositionsList),
    },
    {
        path: "/dashboard/sessions/:id/transactions/list",
        element: withLayout(TransactionsList),
    },
    {
        path: "/dashboard/sessions/:id/analytics",
        element: withLayout(AnalyticsPage),
    },
];
