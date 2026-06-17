import { lazy } from "react";
import { withSuspense } from "./utils";

const Home = lazy(() => import("../features/home/Home"));
const Pricing = lazy(() => import("../features/pricing/Pricing"));

export const publicRoutes = [
    {
        path: "/",
        index: true,
        element: withSuspense(Home),
    },
    {
        path: "/pricing",
        element: withSuspense(Pricing),
    },
];
