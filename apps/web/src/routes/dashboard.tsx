import { AuthenticatedLayout } from "../components";
import { Dashboard } from "../features/dashboard";
import { Settings } from "../features/settings";
import { Plans } from "../features/plans";
import { PurchaseSuccess } from "../features/plans/components/PurchaseSuccess";
import { AdminChoices } from "../features/admin";
import { UserManagement } from "../features/admin/user-management";
import { DatasetManagement } from "../features/admin/dataset-management";

export const dashboardRoutes = [
    {
        path: "/dashboard",
        element: (
            <AuthenticatedLayout>
                <Dashboard />
            </AuthenticatedLayout>
        ),
    },
    {
        path: "/dashboard/settings",
        element: (
            <AuthenticatedLayout>
                <Settings />
            </AuthenticatedLayout>
        ),
    },
    {
        path: "/dashboard/plans",
        element: (
            <AuthenticatedLayout>
                <Plans />
            </AuthenticatedLayout>
        ),
    },
    {
        path: "/dashboard/plans/purchase-success",
        element: (
            <AuthenticatedLayout>
                <PurchaseSuccess />
            </AuthenticatedLayout>
        ),
    },
    {
        path: "/dashboard/admin",
        element: (
            <AuthenticatedLayout>
                <AdminChoices />
            </AuthenticatedLayout>
        ),
    },
    {
        path: "/dashboard/admin/user-management",
        element: (
            <AuthenticatedLayout>
                <UserManagement />
            </AuthenticatedLayout>
        ),
    },
    {
        path: "/dashboard/admin/dataset-management",
        element: (
            <AuthenticatedLayout>
                <DatasetManagement />
            </AuthenticatedLayout>
        ),
    },
];
