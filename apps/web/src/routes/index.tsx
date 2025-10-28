import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from "../features/home/Home";
import Pricing from "../features/pricing/Pricing";
import { Login, Register } from "../features/auth";
import { Terms, Privacy } from "../features/legal";

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
    ],
  },
]);
