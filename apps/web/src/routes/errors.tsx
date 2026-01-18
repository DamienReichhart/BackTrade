import {
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    BannedError,
    InternalServerError,
    ServiceUnavailableError,
    NotFoundError,
} from "../features/errors";

export const errorsRoutes = [
    {
        path: "/error/400",
        element: <BadRequestError />,
    },
    {
        path: "/error/401",
        element: <UnauthorizedError />,
    },
    {
        path: "/error/403",
        element: <ForbiddenError />,
    },
    {
        path: "/error/banned",
        element: <BannedError />,
    },
    {
        path: "/error/500",
        element: <InternalServerError />,
    },
    {
        path: "/error/503",
        element: <ServiceUnavailableError />,
    },
    // Catch-all route for 404
    {
        path: "*",
        element: <NotFoundError />,
    },
];
