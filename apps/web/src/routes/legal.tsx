import { Terms, Privacy } from "../features/legal";
import { LegalMentions } from "../features/legal/LegalMentions";

export const legalRoutes = [
    {
        path: "/terms",
        element: <Terms />,
    },
    {
        path: "/privacy",
        element: <Privacy />,
    },
    {
        path: "/legal-mentions",
        element: <LegalMentions />,
    },
];
