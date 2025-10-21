import { createBrowserRouter } from "react-router-dom";
import App from "../App.jsx";
import Home from "../features/home/Home.jsx";
import Pricing from "../features/pricing/Pricing.jsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        index: true,
        element: <Home />
      },
      {
        path: "/pricing",
        element: <Pricing />
      }
    ]
  }
]);
