/**
 * Auth Controller
 *
 * Handles authentication-related HTTP requests.
 * Orchestrates auth service and email notifications.
 */

import type { Request, Response } from "express";
import authService from "../services/security/auth-service";
import passwordResetService from "../services/security/password-reset-service";
import emailNotificationService from "../services/notifications/email-notification-service";
import { getDeviceInfo } from "../utils/request-context";
import {
    type LoginRequest,
    type RegisterRequest,
    type ForgotPasswordRequest,
    type ResetPasswordRequest,
    PublicUserSchema,
    type RefreshTokenRequest,
} from "@backtrade/types";
import { logger } from "../libs/pino";

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

        // Send login notification email

        const deviceInfo = getDeviceInfo(req);
        await emailNotificationService.sendLoginNotification(
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

        await emailNotificationService.sendWelcomeEmail(
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

    /**
     * Handle forgot password request
     *
     * Initiates password reset flow by sending a verification code to the user's email.
     * Returns 200 regardless of whether the email exists (security measure).
     *
     * @param req - Express request object
     * @param res - Express response object
     */
    async forgotPassword(req: Request, res: Response): Promise<void> {
        const request = req.body as ForgotPasswordRequest;

        await passwordResetService.requestPasswordReset(request);

        // Always return 200 to prevent email enumeration attacks
        res.status(200).json({
            message:
                "If an account exists with this email, a reset code has been sent.",
        });
    }

    /**
     * Handle password reset with verification code
     *
     * Validates the reset code and updates the user's password.
     *
     * @param req - Express request object
     * @param res - Express response object
     */
    async resetPassword(req: Request, res: Response): Promise<void> {
        const request = req.body as ResetPasswordRequest;

        await passwordResetService.resetPassword(request);

        res.status(200).json({
            message: "Password has been reset successfully.",
        });
    }
}

export default new AuthController();
