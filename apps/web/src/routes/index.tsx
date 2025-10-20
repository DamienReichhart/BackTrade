import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from "../features/home/Home";
import Pricing from "../features/pricing/Pricing";

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
    ],
  },
]);
