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
import { logger } from "../libs/logger/pino";

/**
 * Auth Controller
 *
 * Handles authentication-related HTTP requests.
 * Orchestrates auth service and email notifications.
 */
class AuthController {
    private readonly logger: ReturnType<typeof logger.child>;

    constructor() {
        this.logger = logger.child({
            service: "auth-controller",
        });
    }

    /**
     * Handle user login
     *
     * Authenticates user and sends login notification email.
     *
     * @param req - Express request object
     * @param res - Express response object
     */
    async login(req: Request, res: Response): Promise<void> {
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
     *
     * @param req - Express request object
     * @param res - Express response object
     */
    async refreshToken(req: Request, res: Response): Promise<void> {
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
     *
     * @param req - Express request object
     * @param res - Express response object
     */
    async register(req: Request, res: Response): Promise<void> {
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
     *
     * @param req - Express request object
     * @param res - Express response object
     */
    async me(req: Request, res: Response): Promise<void> {
        const user = req.user;
        const publicUser = PublicUserSchema.parse(user);
        res.status(200).json(publicUser);
    }
}

export default new AuthController();
