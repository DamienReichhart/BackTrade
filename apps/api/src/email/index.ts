/**
 * Email Module
 *
 * Provides MJML-based email template rendering with Handlebars support
 *
 * @example
 * ```ts
 * import { templates } from "./email";
 *
 * // Render welcome email
 * const html = await templates.register({
 *   username: "john.doe",
 *   dashboardUrl: "https://backtrade.io/dashboard"
 * });
 *
 * // Render login notification
 * const loginHtml = await templates.login({
 *   username: "john.doe",
 *   loginDate: "December 9, 2025 at 3:45 PM",
 *   device: "Windows PC",
 *   browser: "Chrome 120",
 *   secureAccountUrl: "https://backtrade.io/account/security"
 * });
 * ```
 */

// Register Handlebars helpers on module load
import { registerHelpers } from "./helpers";
registerHelpers();

// Initialize templates on module load
import { precompileTemplates } from "./compiler";
import { logger } from "../libs/logger/pino";

const emailLogger = logger.child({ service: "email" });

precompileTemplates().catch((error) => {
    emailLogger.error({ error }, "Failed to precompile email templates");
});

// Re-export types
export type { BaseEmailData, RegisterEmailData, LoginEmailData } from "./types";

// Re-export compiler utilities
export {
    compileTemplate,
    renderTemplate,
    precompileTemplates,
    clearCache,
    getAvailableTemplates,
    TEMPLATE_DIR,
    PARTIALS_DIR,
} from "./compiler";

// Re-export template functions
export { renderRegisterEmail, renderLoginEmail, templates } from "./templates";
