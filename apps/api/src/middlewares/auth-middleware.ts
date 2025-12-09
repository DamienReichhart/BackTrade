import type { Request, Response, NextFunction } from "express";
import usersService from "../services/base/users-service";
import UnAuthenticatedError from "../errors/web/unauthenticated-error";
import jwtService from "../services/security/jwt-service";

/**
 * Authentication middleware
 *
 * Validates JWT access token from Authorization header and attaches
 * the authenticated user to the request object.
 *
 * @throws UnAuthenticatedError if token is missing or invalid
 */
export async function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        throw new UnAuthenticatedError(
            "You must be authenticated to access this route"
        );
    }

    const decoded = await jwtService.verifyAccessToken(token);
    const userId = decoded.sub;
    const user = await usersService.getUserById(userId);
    req.user = user;
    next();
}
