import type { Request, Response, NextFunction } from "express";
import UnAuthenticatedError from "../errors/web/unauthenticated-error";

/**
 * Admin authorization middleware
 *
 * Ensures that the authenticated user has ADMIN role.
 * Must be used after authMiddleware to ensure req.user is set.
 *
 * @throws UnAuthenticatedError (401) if user is not an admin
 */
export async function adminMiddleware(
    req: Request,
    _res: Response,
    next: NextFunction
) {
    const user = req.user;

    if (!user) {
        throw new UnAuthenticatedError(
            "You must be authenticated to access this route"
        );
    }

    if (user.role !== "ADMIN") {
        throw new UnAuthenticatedError(
            "You must be an admin to access this route"
        );
    }

    next();
}
