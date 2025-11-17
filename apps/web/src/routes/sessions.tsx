import { AuthenticatedLayout } from "../components";
import { SessionRunning } from "../features/session";
import { PositionsList } from "../features/session/positions-list";
import { TransactionsList } from "../features/session/transactions-list";
import { SessionAdd } from "../features/session-add";

export const sessionsRoutes = [
  {
    path: "/dashboard/sessions/add",
    element: (
      <AuthenticatedLayout>
        <SessionAdd />
      </AuthenticatedLayout>
    ),
  },
  {
    path: "/dashboard/sessions/:id",
    element: (
      <AuthenticatedLayout>
        <SessionRunning />
      </AuthenticatedLayout>
    ),
  },
  {
    path: "/sessions/:id/positions/list",
    element: (
      <AuthenticatedLayout>
        <PositionsList />
      </AuthenticatedLayout>
    ),
  },
  {
    path: "/sessions/:id/transactions/list",
    element: (
      <AuthenticatedLayout>
        <TransactionsList />
      </AuthenticatedLayout>
    ),
  },
];
