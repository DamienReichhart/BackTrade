import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from "../features/home/Home";
import Pricing from "../features/pricing/Pricing";
import { Login, Register } from "../features/auth";
import { Terms, Privacy } from "../features/legal";
import { Dashboard } from "../features/dashboard";
import { Settings } from "../features/settings";
import { AuthenticatedLayout } from "../components";
import {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  InternalServerError,
  ServiceUnavailableError,
} from "../features/errors";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        index: true,
        element: <Home />,
      },
      {
        path: "/pricing",
        element: <Pricing />,
      },
      {
        path: "/signin",
        element: <Login />,
      },
      {
        path: "/signup",
        element: <Register />,
      },
      {
        path: "/terms",
        element: <Terms />,
      },
      {
        path: "/privacy",
        element: <Privacy />,
      },
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
      // Error pages
      {
        path: "/error/400",
        element: <BadRequestError />,
      },
      {
        path: "/error/401",
        element: <UnauthorizedError />,
      },
      {
        path: "/error/403",
        element: <ForbiddenError />,
      },
      {
        path: "/error/500",
        element: <InternalServerError />,
      },
      {
        path: "/error/503",
        element: <ServiceUnavailableError />,
      },
      // Catch-all route for 404
      {
        path: "*",
        element: <NotFoundError />,
      },
    ],
  },
]);
