/**
 * MJML Template Compiler
 *
 * Handles loading, compiling, and caching of MJML email templates
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mjml2html from "mjml";
import handlebars, { type TemplateDelegate } from "handlebars";
import { logger } from "../libs/logger/pino";
import type { BaseEmailData } from "./types";

const compilerLogger = logger.child({ service: "email-compiler" });

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

/** Cache for compiled templates */
const templateCache = new Map<string, CompiledTemplate>();

/** MJML compilation options */
const MJML_OPTIONS = {
    validationLevel: "strict" as const,
    minify: true,
    filePath: TEMPLATE_DIR,
};

/**
 * Load and compile an MJML template
 *
 * @param name - Template file name (without .mjml extension)
 * @returns Compiled Handlebars template function
 */
export async function compileTemplate<T = Record<string, unknown>>(
    name: string
): Promise<CompiledTemplate<T>> {
    // Return cached template if available
    if (templateCache.has(name)) {
        return templateCache.get(name) as CompiledTemplate<T>;
    }

    const filePath = path.join(TEMPLATE_DIR, `${name}.mjml`);

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
        compilerLogger.warn(
            { template: name, errors },
            "MJML validation warnings"
        );
    }

    // Compile with Handlebars
    const compiled = handlebars.compile(html) as CompiledTemplate<T>;

    // Cache the compiled template
    templateCache.set(name, compiled as CompiledTemplate);

    compilerLogger.debug({ template: name }, "Template compiled and cached");

    return compiled;
}

/**
 * Render a template with data
 *
 * @param name - Template name
 * @param data - Template data
 * @returns Rendered HTML string
 */
export async function renderTemplate<T extends BaseEmailData>(
    name: string,
    data: T
): Promise<string> {
    const template = await compileTemplate<T>(name);
    return template({
        ...data,
        year: data.year ?? new Date().getFullYear(),
    });
}

/**
 * Pre-compile all templates in the templates directory
 * Call during application startup for optimal performance
 */
export async function precompileTemplates(): Promise<void> {
    try {
        const files = await fs.promises.readdir(TEMPLATE_DIR);
        const mjmlFiles = files.filter(
            (f) => f.endsWith(".mjml") && !f.startsWith("_")
        );

        await Promise.all(
            mjmlFiles.map(async (file) => {
                const name = path.basename(file, ".mjml");
                await compileTemplate(name);
            })
        );

        compilerLogger.info(
            { count: mjmlFiles.length },
            "All email templates precompiled"
        );
    } catch (error) {
        compilerLogger.error({ error }, "Failed to precompile templates");
        throw error;
    }
}

/**
 * Clear the template cache
 * Useful for development hot-reloading
 */
export function clearCache(): void {
    templateCache.clear();
    compilerLogger.debug("Template cache cleared");
}

/**
 * Get list of available template names
 */
export async function getAvailableTemplates(): Promise<string[]> {
    const files = await fs.promises.readdir(TEMPLATE_DIR);
    return files
        .filter((f) => f.endsWith(".mjml") && !f.startsWith("_"))
        .map((f) => path.basename(f, ".mjml"));
}
