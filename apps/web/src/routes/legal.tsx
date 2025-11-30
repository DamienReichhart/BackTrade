import { Terms, Privacy } from "../features/legal";

export const legalRoutes = [
  {
    path: "/terms",
    element: <Terms />,
  },
  {
    path: "/privacy",
    element: <Privacy />,
  },
];
