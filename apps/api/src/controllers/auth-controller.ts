import type { Request, Response } from "express";
import authService from "../services/security/auth-service";
import {
    type LoginRequest,
    type RegisterRequest,
    PublicUserSchema,
    type RefreshTokenRequest,
} from "@backtrade/types";

/**
 * Handle user login
 */
async function login(req: Request, res: Response) {
    const authResponse = await authService.login(
        req.validatedInput as LoginRequest
    );
    res.status(200).json(authResponse);
}

/**
 * Handle token refresh
 */
async function refreshToken(req: Request, res: Response) {
    const refreshToken = req.validatedInput as RefreshTokenRequest;
    const authResponse = await authService.refreshToken(
        refreshToken.refreshToken
    );
    res.status(200).json(authResponse);
}

/**
 * Handle user registration
 */
async function register(req: Request, res: Response) {
    const registerRequest = req.validatedInput as RegisterRequest;
    const authResponse = await authService.register(registerRequest);
    res.status(200).json(authResponse);
}

/**
 * Get current authenticated user
 *
 * Returns the public user data for the authenticated user.
 * Requires valid access token in Authorization header.
 */
async function me(req: Request, res: Response) {
    const user = req.user;
    const publicUser = PublicUserSchema.parse(user);
    res.status(200).json(publicUser);
}

export default {
    login,
    refreshToken,
    register,
    me,
};
