/**
 * Email Template Render Functions
 *
 * Strongly-typed rendering functions for each email template.
 * These functions use the template compiler to render MJML templates with Handlebars.
 */

import type { TemplateCompiler } from "./compiler";
import type {
    RegisterEmailData,
    LoginEmailData,
    AccountDeletedEmailData,
    PasswordResetEmailData,
} from "@backtrade/types";

/**
 * Template renderer class
 *
 * Provides type-safe template rendering functions.
 */
export class TemplateRenderer {
    constructor(private readonly compiler: TemplateCompiler) {}

    /**
     * Render the registration welcome email
     *
     * @param data - Registration email data
     * @returns Rendered HTML string
     *
     * @example
     * ```ts
     * const html = await renderer.renderRegister({
     *   username: "john.doe",
     *   dashboardUrl: "https://backtrade.io/dashboard"
     * });
     * ```
     */
    async renderRegister(data: RegisterEmailData): Promise<string> {
        return this.compiler.renderTemplate("register", data);
    }

    /**
     * Render the login notification email
     *
     * @param data - Login notification email data
     * @returns Rendered HTML string
     *
     * @example
     * ```ts
     * const html = await renderer.renderLogin({
     *   username: "john.doe",
     *   loginDate: "December 9, 2025 at 3:45 PM",
     *   device: "Windows PC",
     *   browser: "Chrome 120",
     *   secureAccountUrl: "https://backtrade.io/account/security"
     * });
     * ```
     */
    async renderLogin(data: LoginEmailData): Promise<string> {
        return this.compiler.renderTemplate("login", data);
    }

    /**
     * Render the account deletion confirmation email
     *
     * @param data - Account deletion email data
     * @returns Rendered HTML string
     *
     * @example
     * ```ts
     * const html = await renderer.renderAccountDeleted({
     *   username: "john.doe",
     *   deletionDate: "January 15, 2025 at 2:30 PM"
     * });
     * ```
     */
    async renderAccountDeleted(data: AccountDeletedEmailData): Promise<string> {
        return this.compiler.renderTemplate("account-deleted", data);
    }

    /**
     * Render the password reset email
     *
     * @param data - Password reset email data
     * @returns Rendered HTML string
     *
     * @example
     * ```ts
     * const html = await renderer.renderPasswordReset({
     *   username: "john.doe",
     *   resetCode: "123456",
     *   expirationMinutes: 15
     * });
     * ```
     */
    async renderPasswordReset(data: PasswordResetEmailData): Promise<string> {
        return this.compiler.renderTemplate("password-reset", data);
    }
}
