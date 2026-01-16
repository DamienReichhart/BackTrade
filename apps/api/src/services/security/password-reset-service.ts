/**
 * Password Reset Service
 *
 * Handles password reset workflow including code generation, validation, and password update.
 * Uses cryptographically secure random codes with time-limited validity.
 */

import { randomBytes, timingSafeEqual } from "node:crypto";
import { usersRepo } from "@backtrade/data";
import type {
    ForgotPasswordRequest,
    ResetPasswordRequest,
} from "@backtrade/types";
import { validatePassword } from "@backtrade/utils";
import { BaseService } from "../base/base-service";
import hashService from "./hash-service";
import emailNotificationService from "../notifications/email-notification-service";
import BadRequestError from "../../errors/web/bad-request-error";

/**
 * Configuration for password reset functionality
 */
const PASSWORD_RESET_CONFIG = {
    /** Length of the reset code in digits */
    CODE_LENGTH: 6,
    /** Code validity duration in minutes */
    EXPIRATION_MINUTES: 15,
    /** Maximum number of characters for code to prevent abuse */
    MAX_CODE_LENGTH: 10,
} as const;

/**
 * Password Reset Service
 *
 * Manages the complete password reset flow:
 * 1. Generate and store reset code
 * 2. Send reset email with code
 * 3. Validate code and reset password
 */
class PasswordResetService extends BaseService {
    constructor() {
        super("password-reset-service");
    }

    /**
     * Generate a cryptographically secure numeric reset code
     *
     * Uses crypto.randomBytes for secure random number generation.
     * The code is numeric-only for ease of user input.
     *
     * @returns A random numeric string of CODE_LENGTH digits
     */
    private generateResetCode(): string {
        // Generate enough random bytes to get digits
        const randomBuffer = randomBytes(PASSWORD_RESET_CONFIG.CODE_LENGTH);

        // Convert to numeric string (each byte mod 10 gives a digit)
        const code = Array.from(randomBuffer)
            .map((byte) => byte % 10)
            .join("");

        return code;
    }

    /**
     * Calculate the expiration timestamp for a reset code
     *
     * @returns Date object representing when the code expires
     */
    private calculateExpirationTime(): Date {
        const expirationTime = new Date();
        expirationTime.setMinutes(
            expirationTime.getMinutes() +
                PASSWORD_RESET_CONFIG.EXPIRATION_MINUTES
        );
        return expirationTime;
    }

    /**
     * Check if a reset code has expired
     *
     * @param expiresAt - The expiration timestamp
     * @returns True if the code has expired, false otherwise
     */
    private isCodeExpired(expiresAt: Date | null | undefined): boolean {
        if (!expiresAt) {
            return true;
        }
        return new Date() > expiresAt;
    }

    /**
     * Request a password reset for a given email
     *
     * This method:
     * 1. Looks up the user by email (silently fails if not found for security)
     * 2. Generates a secure reset code
     * 3. Stores the code and expiration in the database
     * 4. Sends an email with the reset code
     *
     * Note: For security, this method doesn't reveal whether the email exists.
     * It logs warnings for monitoring but returns success regardless.
     *
     * @param request - Contains the email address to send reset code to
     *
     * @example
     * ```ts
     * await passwordResetService.requestPasswordReset({ email: "user@example.com" });
     * ```
     */
    async requestPasswordReset(request: ForgotPasswordRequest): Promise<void> {
        const email = request.email.toLowerCase();

        this.logger.debug({ email }, "Processing password reset request");

        // Look up user by email
        const user = await usersRepo.getUserByEmail(email);

        // Security: Don't reveal if email exists or not
        // Log for monitoring but don't throw error
        if (!user) {
            this.logger.warn(
                { email },
                "Password reset requested for non-existent email"
            );
            // Return silently to prevent email enumeration attacks
            return;
        }

        // Check if user is banned
        if (user.is_banned) {
            this.logger.warn(
                { userId: user.id },
                "Password reset requested for banned user"
            );
            // Return silently to prevent revealing account status
            return;
        }

        // Generate reset code and expiration
        const resetCode = this.generateResetCode();
        const expiresAt = this.calculateExpirationTime();

        this.logger.trace({ userId: user.id }, "Generated password reset code");

        // Store reset code in database
        await usersRepo.updateUser(user.id, {
            password_reset_code: resetCode,
            password_reset_expires_at: expiresAt,
        });

        this.logger.trace(
            { userId: user.id },
            "Stored password reset code in database"
        );

        // Extract username from email (part before @)
        const username = email.split("@")[0] ?? email;

        // Send password reset email
        try {
            await emailNotificationService.sendPasswordResetEmail(
                email,
                username,
                resetCode,
                PASSWORD_RESET_CONFIG.EXPIRATION_MINUTES
            );

            this.logger.info(
                { userId: user.id },
                "Password reset email queued successfully"
            );
        } catch (error) {
            // Log error but still consider the operation successful
            // The code is stored, user can request a new one if email fails
            this.logger.error(
                {
                    userId: user.id,
                    error:
                        error instanceof Error ? error.message : String(error),
                },
                "Failed to queue password reset email"
            );
            // Rethrow to let caller know there was an issue
            throw error;
        }
    }

    /**
     * Securely compare two strings using constant-time comparison
     *
     * Prevents timing attacks by ensuring comparison takes the same time
     * regardless of where strings differ.
     *
     * @param a - First string to compare
     * @param b - Second string to compare
     * @returns True if strings are equal, false otherwise
     */
    private secureCompare(a: string, b: string): boolean {
        if (a.length !== b.length) {
            return false;
        }

        const bufferA = Buffer.from(a, "utf8");
        const bufferB = Buffer.from(b, "utf8");

        return timingSafeEqual(bufferA, bufferB);
    }

    /**
     * Reset a user's password using email and reset code
     *
     * This method:
     * 1. Finds the user by email (prevents code enumeration)
     * 2. Validates the reset code matches using constant-time comparison
     * 3. Validates the code hasn't expired
     * 4. Validates the new password meets requirements
     * 5. Hashes and stores the new password
     * 6. Clears the reset code from the database
     *
     * Security improvements:
     * - Requires email to prevent brute-force code guessing
     * - Uses constant-time comparison to prevent timing attacks
     * - Validates email ownership before accepting the code
     *
     * @param request - Contains email, reset code, and new password
     * @throws BadRequestError if code is invalid, expired, or password is weak
     *
     * @example
     * ```ts
     * await passwordResetService.resetPassword({
     *   email: "user@example.com",
     *   code: "123456",
     *   newPassword: "newSecurePassword123"
     * });
     * ```
     */
    async resetPassword(request: ResetPasswordRequest): Promise<void> {
        const { email, code, newPassword } = request;

        this.logger.debug({ email }, "Processing password reset with code");

        // Validate code format
        if (!code || code.length === 0) {
            throw new BadRequestError("Reset code is required");
        }

        if (code.length > PASSWORD_RESET_CONFIG.MAX_CODE_LENGTH) {
            throw new BadRequestError("Invalid reset code format");
        }

        // Find user by email (more secure than finding by code)
        const user = await usersRepo.getUserByEmail(email);

        if (!user) {
            this.logger.warn(
                { email },
                "Password reset attempted for non-existent email"
            );
            // Use generic message to prevent email enumeration
            throw new BadRequestError("Invalid or expired reset code");
        }

        // Check if user has a reset code
        if (!user.password_reset_code) {
            this.logger.warn(
                { userId: user.id },
                "Password reset attempted without active reset code"
            );
            throw new BadRequestError("Invalid or expired reset code");
        }

        // Check if code has expired (check before comparing to avoid unnecessary work)
        if (this.isCodeExpired(user.password_reset_expires_at)) {
            this.logger.warn(
                { userId: user.id },
                "Password reset attempted with expired code"
            );

            // Clear the expired code
            await usersRepo.updateUser(user.id, {
                password_reset_code: null,
                password_reset_expires_at: null,
            });

            throw new BadRequestError(
                "Reset code has expired. Please request a new one."
            );
        }

        // Verify the code matches using constant-time comparison (prevents timing attacks)
        if (!this.secureCompare(code, user.password_reset_code)) {
            this.logger.warn(
                { userId: user.id },
                "Password reset attempted with incorrect code"
            );
            throw new BadRequestError("Invalid or expired reset code");
        }

        // Validate new password strength
        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            throw new BadRequestError(
                passwordValidation.error ??
                    "Password does not meet requirements"
            );
        }

        // Hash the new password
        const hashedPassword = await hashService.hashPassword(newPassword);

        // Update user with new password and clear reset code
        await usersRepo.updateUser(user.id, {
            password_hash: hashedPassword,
            password_reset_code: null,
            password_reset_expires_at: null,
        });

        this.logger.info(
            { userId: user.id },
            "Password reset completed successfully"
        );
    }
}

export default new PasswordResetService();
