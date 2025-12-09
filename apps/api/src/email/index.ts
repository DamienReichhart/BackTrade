import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mjml2html from "mjml";
import handlebars from "handlebars";
import type { TemplateDelegate } from "handlebars";
import { formatDate } from "@backtrade/utils";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templateDirectory = path.join(__dirname, "templates");

// Type for compiled templates
type CompiledTemplate = TemplateDelegate;

// Cache compiled templates
const templateCache = new Map<string, CompiledTemplate>();

async function loadTemplate(name: string): Promise<CompiledTemplate> {
    // Check cache first
    if (templateCache.has(name)) {
        return templateCache.get(name)!;
    }

    const filePath = path.join(templateDirectory, `${name}.mjml`);
    const raw = await fs.promises.readFile(filePath, "utf-8");
    
    // Compile MJML to HTML
    const { html, errors } = mjml2html(raw, {
        validationLevel: "strict", // Catch errors early
        minify: true, // Production optimization
    });

    // Log MJML errors if any
    if (errors.length > 0) {
        console.warn(`MJML warnings for ${name}:`, errors);
    }

    // Compile Handlebars template
    const compiled = handlebars.compile(html);
    
    // Cache it
    templateCache.set(name, compiled);
    
    return compiled;
}

// Initialize all templates at startup
async function initializeTemplates(): Promise<void> {
    const templateFiles = await fs.promises.readdir(templateDirectory);
    const mjmlFiles = templateFiles.filter(f => f.endsWith('.mjml'));
    
    await Promise.all(
        mjmlFiles.map(async (file) => {
            const name = path.basename(file, '.mjml');
            await loadTemplate(name);
        })
    );
}

// Export templates with proper typing
export const templates = {
    async register(data: Record<string, unknown>): Promise<string> {
        const template = await loadTemplate("register");
        return template(data);
    },
    async login(data: Record<string, unknown>): Promise<string> {
        const template = await loadTemplate("login");
        return template(data);
    },
};

handlebars.registerHelper('formatDate', (date: Date) => {
    return formatDate(date);
});
handlebars.registerHelper('ifEquals', (arg1: any, arg2: any, options: any) => {
    return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
});

// Initialize on module load
initializeTemplates().catch(console.error);