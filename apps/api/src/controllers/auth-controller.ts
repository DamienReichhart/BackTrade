/**
 * Auth Controller
 *
 * Handles authentication-related HTTP requests.
 * Orchestrates auth service and email notifications.
 */

import type { Request, Response } from "express";
import authService from "../services/security/auth-service";
import emailNotificationService from "../services/notifications/email-notification-service";
import { getDeviceInfo } from "../utils/request-context";
import {
    type LoginRequest,
    type RegisterRequest,
    PublicUserSchema,
    type RefreshTokenRequest,
} from "@backtrade/types";

/**
 * Handle user login
 *
 * Authenticates user and sends login notification email.
 */
async function login(req: Request, res: Response) {
    const loginRequest = req.body as LoginRequest;

    const authResponse = await authService.login(loginRequest);

    // Send login notification email (fire-and-forget)
    const deviceInfo = getDeviceInfo(req);
    emailNotificationService.sendLoginNotification(
        loginRequest.email,
        loginRequest.email.split("@")[0] ?? loginRequest.email,
        new Date(),
        deviceInfo
    );

    res.status(200).json(authResponse);
}

/**
 * Handle token refresh
 */
async function refreshToken(req: Request, res: Response) {
    const refreshToken = req.body as RefreshTokenRequest;
    const authResponse = await authService.refreshToken(
        refreshToken.refreshToken
    );
    res.status(200).json(authResponse);
}

/**
 * Handle user registration
 *
 * Creates user account and sends welcome email.
 */
async function register(req: Request, res: Response) {
    const registerRequest = req.body as RegisterRequest;

    const authResponse = await authService.register(registerRequest);

    // Send welcome email (fire-and-forget)
    emailNotificationService.sendWelcomeEmail(
        registerRequest.email,
        registerRequest.email.split("@")[0] ?? registerRequest.email
    );

    res.status(201).json(authResponse);
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
