import Home from "../features/home/Home";
import Pricing from "../features/pricing/Pricing";

export const publicRoutes = [
  {
    path: "/",
    index: true,
    element: <Home />,
  },
  {
    path: "/pricing",
    element: <Pricing />,
  },
];
