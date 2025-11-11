import { AuthenticatedLayout } from "../components";
import { Dashboard } from "../features/dashboard";
import { Settings } from "../features/settings";
import { Plans } from "../features/plans";

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
];
