import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import { dashboardRoutes } from "./dashboard";
import { sessionsRoutes } from "./sessions";
import { errorsRoutes } from "./errors";
import { publicRoutes } from "./public";
import { authRoutes } from "./auth";
import { legalRoutes } from "./legal";
import { InternalServerError } from "../features/errors";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        errorElement: <InternalServerError />,
        children: [
            ...publicRoutes,
            ...authRoutes,
            ...legalRoutes,
            ...dashboardRoutes,
            ...sessionsRoutes,
            ...errorsRoutes,
        ],
    },
]);
