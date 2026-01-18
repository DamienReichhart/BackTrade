/**
 * @backtrade/mailer
 *
 * Shared mailer package for BackTrade.
 * Contains email sending logic, template compilation, and rendering.
 *
 * @example
 * ```ts
 * import { createMailerClient, createMailerService, createTemplateCompiler, createTemplateRenderer, registerHelpers } from "@backtrade/mailer";
 * import { logger } from "./libs/pino";
 *
 * // Register Handlebars helpers
 * registerHelpers();
 *
 * // Create mailer client
 * const transporter = createMailerClient({ logger });
 *
 * // Create mailer service
 * const mailerService = createMailerService({
 *   transporter,
 *   logger
 * });
 *
 * // Create template compiler
 * const compiler = createTemplateCompiler({ logger });
 *
 * // Create template renderer
 * const renderer = createTemplateRenderer(compiler);
 *
 * // Render and send email
 * const html = await renderer.renderRegister({
 *   username: "john.doe",
 *   dashboardUrl: "https://backtrade.io/dashboard"
 * });
 *
 * await mailerService.sendEmail({
 *   to: "user@example.com",
 *   subject: "Welcome!",
 *   html
 * });
 * ```
 */

// Register Handlebars helpers on module load
import { registerHelpers } from "./templates/helpers";
registerHelpers();

// Mailer client factory
export { createMailerClient } from "./libs/mailer";
export type { MailerConfig } from "./libs/mailer";

// Mailer service
import {
    MailerService,
    type MailerServiceConfig,
    type SendEmailOptions,
} from "./services/mailer-service";
export { MailerService, type MailerServiceConfig, type SendEmailOptions };

// Template compiler
import {
    TemplateCompiler,
    type TemplateCompilerConfig,
    type CompiledTemplate,
} from "./templates/compiler";
export { TemplateCompiler, type TemplateCompilerConfig, type CompiledTemplate };

// Template renderer
import { TemplateRenderer } from "./templates/renderers";
export { TemplateRenderer };

// Handlebars helpers
export { registerHelpers } from "./templates/helpers";

/**
 * Factory function to create a mailer service instance
 *
 * @param config - Configuration with transporter and logger
 * @returns MailerService instance
 */
export function createMailerService(
    config: MailerServiceConfig
): MailerService {
    return new MailerService(config);
}

/**
 * Factory function to create a template compiler instance
 *
 * @param config - Configuration with logger
 * @returns TemplateCompiler instance
 */
export function createTemplateCompiler(
    config: TemplateCompilerConfig
): TemplateCompiler {
    return new TemplateCompiler(config);
}

/**
 * Factory function to create a template renderer instance
 *
 * @param compiler - TemplateCompiler instance
 * @returns TemplateRenderer instance
 */
export function createTemplateRenderer(
    compiler: TemplateCompiler
): TemplateRenderer {
    return new TemplateRenderer(compiler);
}
