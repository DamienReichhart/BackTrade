import { AuthenticatedLayout } from "../components";
import { Dashboard } from "../features/dashboard";
import { Settings } from "../features/settings";
import { Plans } from "../features/plans";
import { Support } from "../features/support";
import { SupportRequestDetail } from "../features/support/components/SupportRequestDetail";

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
    path: "/dashboard/support",
    element: (
      <AuthenticatedLayout>
        <Support />
      </AuthenticatedLayout>
    ),
  },
  {
    path: "/dashboard/support/:id",
    element: (
      <AuthenticatedLayout>
        <SupportRequestDetail />
      </AuthenticatedLayout>
    ),
  },
];
