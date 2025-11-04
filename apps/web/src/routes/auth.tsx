import { Login, Register } from "../features/auth";

export const authRoutes = [
  {
    path: "/signin",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Register />,
  },
];
