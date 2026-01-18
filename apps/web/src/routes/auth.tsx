import { Login, Register, ForgotPassword } from "../features/auth";

export const authRoutes = [
    {
        path: "/signin",
        element: <Login />,
    },
    {
        path: "/signup",
        element: <Register />,
    },
    {
        path: "/forgot-password",
        element: <ForgotPassword />,
    },
];
