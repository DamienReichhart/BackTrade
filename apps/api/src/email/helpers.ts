/**
 * Handlebars Helpers
 *
 * Custom helpers for email template rendering
 */

import handlebars from "handlebars";
import { formatDate } from "@backtrade/utils";

/**
 * Register all custom Handlebars helpers
 * Call this once during module initialization
 */
export function registerHelpers(): void {
    // Format date helper
    handlebars.registerHelper("formatDate", (date: Date) => {
        return formatDate(date);
    });

    // Current year helper (for copyright footers)
    handlebars.registerHelper("year", () => {
        return new Date().getFullYear();
    });

    // Equality comparison helper
    handlebars.registerHelper(
        "ifEquals",
        function (
            this: unknown,
            arg1: unknown,
            arg2: unknown,
            options: Handlebars.HelperOptions
        ) {
            return arg1 === arg2 ? options.fn(this) : options.inverse(this);
        }
    );

    // Unless equals helper
    handlebars.registerHelper(
        "unlessEquals",
        function (
            this: unknown,
            arg1: unknown,
            arg2: unknown,
            options: Handlebars.HelperOptions
        ) {
            return arg1 !== arg2 ? options.fn(this) : options.inverse(this);
        }
    );

    // Conditional default value helper
    handlebars.registerHelper(
        "default",
        (value: unknown, defaultValue: unknown) => {
            return value ?? defaultValue;
        }
    );

    // Uppercase helper
    handlebars.registerHelper("uppercase", (str: string) => {
        return typeof str === "string" ? str.toUpperCase() : str;
    });

    // Lowercase helper
    handlebars.registerHelper("lowercase", (str: string) => {
        return typeof str === "string" ? str.toLowerCase() : str;
    });
}
