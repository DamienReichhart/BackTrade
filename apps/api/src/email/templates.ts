/**
 * Email Template Render Functions
 *
 * Strongly-typed rendering functions for each email template
 */

import { renderTemplate } from "./compiler";
import type { RegisterEmailData, LoginEmailData } from "./types";

/**
 * Render the registration welcome email
 *
 * @param data - Registration email data
 * @returns Rendered HTML string
 *
 * @example
 * ```ts
 * const html = await renderRegisterEmail({
 *   username: "john.doe",
 *   dashboardUrl: "https://backtrade.io/dashboard"
 * });
 * ```
 */
export async function renderRegisterEmail(
    data: RegisterEmailData
): Promise<string> {
    return renderTemplate("register", data);
}

/**
 * Render the login notification email
 *
 * @param data - Login notification email data
 * @returns Rendered HTML string
 *
 * @example
 * ```ts
 * const html = await renderLoginEmail({
 *   username: "john.doe",
 *   loginDate: "December 9, 2025 at 3:45 PM",
 *   device: "Windows PC",
 *   browser: "Chrome 120",
 *   secureAccountUrl: "https://backtrade.io/account/security"
 * });
 * ```
 */
export async function renderLoginEmail(data: LoginEmailData): Promise<string> {
    return renderTemplate("login", data);
}

/**
 * Email templates object for convenient access
 *
 * @example
 * ```ts
 * import { templates } from "./email";
 *
 * const html = await templates.register({ ... });
 * ```
 */
export const templates = {
    register: renderRegisterEmail,
    login: renderLoginEmail,
} as const;
