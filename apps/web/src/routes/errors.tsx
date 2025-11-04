import {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
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
