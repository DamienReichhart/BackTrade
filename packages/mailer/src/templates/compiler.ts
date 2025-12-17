/**
 * MJML Template Compiler
 *
 * Handles loading, compiling, and caching of MJML email templates.
 * Converts MJML to HTML and compiles Handlebars templates for dynamic content.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mjml2html from "mjml";
import handlebars, { type TemplateDelegate } from "handlebars";
import type { Logger } from "@backtrade/logger";
import type { BaseEmailData } from "@backtrade/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Directory containing MJML templates */
export const TEMPLATE_DIR = path.join(__dirname, "templates");

/** Directory containing reusable MJML partials */
export const PARTIALS_DIR = path.join(TEMPLATE_DIR, "partials");

/** Compiled template function type */
export type CompiledTemplate<T = Record<string, unknown>> = TemplateDelegate<
    T & BaseEmailData
>;

/** Template compiler configuration */
export interface TemplateCompilerConfig {
    /** Logger instance from the consuming application */
    logger: Logger;
}

/** MJML compilation options */
const MJML_OPTIONS = {
    validationLevel: "strict" as const,
    minify: true,
    filePath: TEMPLATE_DIR,
};

/**
 * Template compiler class
 *
 * Manages template compilation, caching, and rendering.
 */
export class TemplateCompiler {
    private readonly templateCache = new Map<string, CompiledTemplate>();
    private readonly logger: ReturnType<Logger["child"]>;

    constructor(config: TemplateCompilerConfig) {
        this.logger = config.logger.child({
            service: "email-compiler",
        });
    }

    /**
     * Load and compile an MJML template
     *
     * @param name - Template file name (without .mjml extension)
     * @returns Compiled Handlebars template function
     */
    async compileTemplate<T = Record<string, unknown>>(
        name: string
    ): Promise<CompiledTemplate<T>> {
        // Validate template name to prevent path traversal
        if (
            name.includes("..") ||
            name.includes("/") ||
            name.includes("\\") ||
            name.includes("\0") ||
            name.trim() !== name ||
            name.length === 0
        ) {
            throw new Error(`Invalid template name: ${name}`);
        }

        // Return cached template if available
        if (this.templateCache.has(name)) {
            return this.templateCache.get(name) as CompiledTemplate<T>;
        }

        // Resolve path and verify it's within TEMPLATE_DIR to prevent path traversal
        const filePath = path.resolve(TEMPLATE_DIR, `${name}.mjml`);
        const templateDirResolved = path.resolve(TEMPLATE_DIR);

        if (!filePath.startsWith(templateDirResolved + path.sep)) {
            throw new Error(`Invalid template name: ${name}`);
        }

        // Verify file exists
        try {
            await fs.promises.access(filePath, fs.constants.R_OK);
        } catch {
            throw new Error(`Template not found: ${name}`);
        }

        const raw = await fs.promises.readFile(filePath, "utf-8");

        // Compile MJML to HTML
        const { html, errors } = mjml2html(raw, MJML_OPTIONS);

        if (errors.length > 0) {
            this.logger.warn(
                { template: name, errors },
                "MJML validation warnings"
            );
        }

        // Compile with Handlebars
        const compiled = handlebars.compile(html) as CompiledTemplate<T>;

        // Cache the compiled template
        this.templateCache.set(name, compiled as CompiledTemplate);

        this.logger.debug({ template: name }, "Template compiled and cached");

        return compiled;
    }

    /**
     * Render a template with data
     *
     * @param name - Template name
     * @param data - Template data
     * @returns Rendered HTML string
     */
    async renderTemplate<T extends BaseEmailData>(
        name: string,
        data: T
    ): Promise<string> {
        const template = await this.compileTemplate<T>(name);
        return template({
            ...data,
            year: data.year ?? new Date().getFullYear(),
        });
    }

    /**
     * Pre-compile all templates in the templates directory
     * Call during application startup for optimal performance
     */
    async precompileTemplates(): Promise<void> {
        try {
            const files = await fs.promises.readdir(TEMPLATE_DIR);
            const mjmlFiles = files.filter(
                (f) => f.endsWith(".mjml") && !f.startsWith("_")
            );

            await Promise.all(
                mjmlFiles.map(async (file) => {
                    const name = path.basename(file, ".mjml");
                    await this.compileTemplate(name);
                })
            );

            this.logger.info(
                { count: mjmlFiles.length },
                "All email templates precompiled"
            );
        } catch (error) {
            this.logger.error({ error }, "Failed to precompile templates");
            throw error;
        }
    }

    /**
     * Clear the template cache
     * Useful for development hot-reloading
     */
    clearCache(): void {
        this.templateCache.clear();
        this.logger.debug("Template cache cleared");
    }

    /**
     * Get list of available template names
     */
    async getAvailableTemplates(): Promise<string[]> {
        const files = await fs.promises.readdir(TEMPLATE_DIR);
        return files
            .filter((f) => f.endsWith(".mjml") && !f.startsWith("_"))
            .map((f) => path.basename(f, ".mjml"));
    }
}
