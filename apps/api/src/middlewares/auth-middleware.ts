import type { Request, Response, NextFunction } from "express";
import usersService from "../services/crud/users-service";
import UnAuthenticatedError from "../errors/web/unauthenticated-error";
import jwtService from "../services/security/jwt-service";

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
    const userId = decoded.sub.id;
    const user = await usersService.getUserById(userId);
    req.user = user;
    next();
}
