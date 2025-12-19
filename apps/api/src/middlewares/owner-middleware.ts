import type { User } from "@backtrade/types";
import ForbiddenError from "../errors/web/forbidden-error";
import UnAuthenticatedError from "../errors/web/unauthenticated-error";
import type { Request, Response, NextFunction } from "express";

/**
 * Owner authorization middleware factory
 *
 * Creates a middleware that ensures the authenticated user is the owner of the resource.
 * Must be used after authMiddleware to ensure req.user is set.
 *
 */
export function ownerMiddleware(
    getUserForSubject: (req: Request) => Promise<User>
) {
    return async (req: Request, _res: Response, next: NextFunction) => {
        const reqUser = req.user;

        if (!reqUser) {
            throw new UnAuthenticatedError(
                "You must be authenticated to access this route"
            );
        }

        const resourceOwner = await getUserForSubject(req);
        if (resourceOwner.id !== reqUser.id) {
            throw new ForbiddenError("You are not the owner of this resource");
        }

        next();
    };
}
