import { lazy } from "react";
import { withSuspense } from "./utils";

const Terms = lazy(() =>
    import("../features/legal").then((m) => ({ default: m.Terms }))
);
const Privacy = lazy(() =>
    import("../features/legal").then((m) => ({ default: m.Privacy }))
);
const LegalMentions = lazy(() =>
    import("../features/legal/LegalMentions").then((m) => ({
        default: m.LegalMentions,
    }))
);

export const legalRoutes = [
    {
        path: "/terms",
        element: withSuspense(Terms),
    },
    {
        path: "/privacy",
        element: withSuspense(Privacy),
    },
    {
        path: "/legal-mentions",
        element: withSuspense(LegalMentions),
    },
];
