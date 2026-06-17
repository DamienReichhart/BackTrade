import { lazy } from "react";
import { withLayout } from "./utils";

const Dashboard = lazy(() =>
    import("../features/dashboard").then((m) => ({ default: m.Dashboard }))
);
const Settings = lazy(() =>
    import("../features/settings").then((m) => ({ default: m.Settings }))
);
const Plans = lazy(() =>
    import("../features/plans").then((m) => ({ default: m.Plans }))
);
const PurchaseSuccess = lazy(() =>
    import("../features/plans/components/PurchaseSuccess").then((m) => ({
        default: m.PurchaseSuccess,
    }))
);
const AdminChoices = lazy(() =>
    import("../features/admin").then((m) => ({ default: m.AdminChoices }))
);
const UserManagement = lazy(() =>
    import("../features/admin/user-management").then((m) => ({
        default: m.UserManagement,
    }))
);
const DatasetManagement = lazy(() =>
    import("../features/admin/dataset-management").then((m) => ({
        default: m.DatasetManagement,
    }))
);
const InstrumentManagement = lazy(() =>
    import("../features/admin/instrument-management").then((m) => ({
        default: m.InstrumentManagement,
    }))
);

export const dashboardRoutes = [
    {
        path: "/dashboard",
        element: withLayout(Dashboard),
    },
    {
        path: "/dashboard/settings",
        element: withLayout(Settings),
    },
    {
        path: "/dashboard/plans",
        element: withLayout(Plans),
    },
    {
        path: "/dashboard/plans/purchase-success",
        element: withLayout(PurchaseSuccess),
    },
    {
        path: "/dashboard/admin",
        element: withLayout(AdminChoices),
    },
    {
        path: "/dashboard/admin/user-management",
        element: withLayout(UserManagement),
    },
    {
        path: "/dashboard/admin/dataset-management",
        element: withLayout(DatasetManagement),
    },
    {
        path: "/dashboard/admin/instrument-management",
        element: withLayout(InstrumentManagement),
    },
];
