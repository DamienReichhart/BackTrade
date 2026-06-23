import { lazy } from "react";
import { withSuspense } from "./utils";

const Login = lazy(() =>
    import("../features/auth").then((m) => ({ default: m.Login }))
);
const Register = lazy(() =>
    import("../features/auth").then((m) => ({ default: m.Register }))
);
const ForgotPassword = lazy(() =>
    import("../features/auth").then((m) => ({ default: m.ForgotPassword }))
);

export const authRoutes = [
    {
        path: "/signin",
        element: withSuspense(Login),
    },
    {
        path: "/signup",
        element: withSuspense(Register),
    },
    {
        path: "/forgot-password",
        element: withSuspense(ForgotPassword),
    },
];
